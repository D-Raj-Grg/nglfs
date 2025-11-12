import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getHashedIP, getClientIP } from "@/lib/utils/ip-hash";
import { getParsedUserAgent } from "@/lib/utils/user-agent-parser";
import { getClassifiedReferrer } from "@/lib/utils/referrer-classifier";
import { extractUTMParams } from "@/lib/utils/utm-params";
import { sendMessageNotification } from "@/lib/notifications/server";
import type { NotificationContentMode } from "@/lib/types/notifications.types";

/**
 * Message send validation schema
 */
const messageSendSchema = z.object({
  recipient_username: z.string().min(3).max(20),
  content: z.string().min(1).max(500),
  // Optional client-side tracking data
  clientData: z
    .object({
      timezone: z.string().optional(),
      language: z.string().optional(),
      screenResolution: z.string().optional(),
      viewportSize: z.string().optional(),
      availableScreen: z.string().optional(),
      colorDepth: z.number().optional(),
      pixelRatio: z.number().optional(),
      touchSupport: z.boolean().optional(),
      connectionType: z.string().nullable().optional(),
    })
    .optional(),
});

/**
 * Check rate limit for anonymous message sending
 * Limit: 10 messages per IP per hour
 */
async function checkRateLimit(
  supabase: ReturnType<typeof import('@supabase/ssr').createServerClient>,
  ipHash: string
): Promise<{ allowed: boolean; remaining?: number; resetAt?: Date }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // Count messages from this IP in the last hour
  const { data, error, count } = await supabase
    .from("messages")
    .select("created_at", { count: "exact", head: false })
    .eq("sender_ip_hash", ipHash)
    .gte("created_at", oneHourAgo.toISOString());

  if (error) {
    console.error("Error checking rate limit:", error);
    // Allow on error to not block legitimate users
    return { allowed: true };
  }

  const messageCount = count || 0;
  const limit = 10;

  if (messageCount >= limit) {
    // Find the oldest message to calculate reset time
    const oldestMessage = data?.[0];
    const resetAt = oldestMessage
      ? new Date(new Date(oldestMessage.created_at).getTime() + 60 * 60 * 1000)
      : new Date(Date.now() + 60 * 60 * 1000);

    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  return {
    allowed: true,
    remaining: limit - messageCount,
  };
}

/**
 * Check if sender is blocked by recipient
 */
async function isBlocked(
  supabase: ReturnType<typeof import('@supabase/ssr').createServerClient>,
  recipientId: string,
  ipHash: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("blocked_senders")
    .select("id")
    .eq("user_id", recipientId)
    .eq("blocked_ip_hash", ipHash)
    .maybeSingle();

  if (error) {
    console.error("Error checking blocked status:", error);
    return false; // Don't block on error
  }

  return !!data;
}

/**
 * POST /api/messages/send
 * Send an anonymous message to a user
 *
 * Request body:
 * {
 *   "recipient_username": string,
 *   "content": string (1-500 chars)
 * }
 *
 * Rate limit: 3 messages per IP per hour
 */
export async function POST(request: NextRequest) {
  try {
    // Create a server Supabase client without cookie handling
    // This ensures requests are treated as anonymous (anon role)
    const { createServerClient } = await import('@supabase/ssr');
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {
            // No-op: we don't need to set cookies for anonymous requests
          },
        },
      }
    );

    // Parse and validate request body
    const body = await request.json();
    const validationResult = messageSendSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid message data",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { recipient_username, content, clientData } = validationResult.data;

    // Collect enhanced tracking data
    const ipHash = getHashedIP(request.headers);
    const rawIP = getClientIP(request.headers); // Raw IP for recipient visibility
    const userAgent = getParsedUserAgent(request.headers);
    const referrer = getClassifiedReferrer(request.headers);
    const utmParams = extractUTMParams(request.nextUrl.searchParams);

    // Find recipient profile
    const { data: recipient, error: recipientError } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("username", recipient_username.toLowerCase())
      .single();

    if (recipientError || !recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Check if sender is blocked
    const blocked = await isBlocked(supabase, recipient.id, ipHash);
    if (blocked) {
      return NextResponse.json(
        {
          error: "Unable to send message. You may have been blocked by this user.",
        },
        { status: 403 }
      );
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(supabase, ipHash);
    if (!rateLimit.allowed) {
      const resetTime = rateLimit.resetAt
        ? new Date(rateLimit.resetAt).toLocaleTimeString()
        : "soon";

      return NextResponse.json(
        {
          error: `Rate limit exceeded. You can send 10 messages per hour. Try again after ${resetTime}.`,
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      );
    }

    // Insert message with enhanced tracking data
    const { data: message, error: insertError } = await supabase
      .from("messages")
      .insert({
        recipient_id: recipient.id,
        content: content.trim(),
        sender_ip_hash: ipHash,
        sender_ip_raw: rawIP, // Raw IP address for recipient visibility
        is_read: false,
        // Server-side tracking (User-Agent, IP, Referrer)
        sender_device_type: userAgent.device.type,
        sender_browser: userAgent.browser.fullName,
        sender_os: userAgent.os.fullName,
        sender_referrer_platform: referrer.platform,
        sender_utm_source: utmParams.source,
        sender_utm_campaign: utmParams.campaign,
        // Client-side tracking (from JavaScript APIs)
        sender_timezone: clientData?.timezone || null,
        sender_language: clientData?.language || null,
        sender_screen_resolution: clientData?.screenResolution || null,
        sender_viewport_size: clientData?.viewportSize || null,
        sender_available_screen: clientData?.availableScreen || null,
        sender_color_depth: clientData?.colorDepth || null,
        sender_pixel_ratio: clientData?.pixelRatio || null,
        sender_touch_support: clientData?.touchSupport || false,
        sender_connection_type: clientData?.connectionType || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting message:", insertError);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    // =====================================================
    // Send Push Notification
    // =====================================================
    try {
      // Fetch recipient's notification preferences
      const { data: recipientProfile, error: profileError } = await supabase
        .from("profiles")
        .select("notification_preferences")
        .eq("id", recipient.id)
        .single();

      if (!profileError && recipientProfile?.notification_preferences) {
        const preferences = recipientProfile.notification_preferences as {
          enabled?: boolean;
          show_preview?: boolean;
        };

        // Only send notification if enabled
        if (preferences.enabled) {
          const contentMode: NotificationContentMode = preferences.show_preview
            ? "preview"
            : "private";

          // Send push notification (don't await - fire and forget)
          sendMessageNotification(
            recipient.id,
            message.id,
            content,
            contentMode
          ).catch((error) => {
            // Log error but don't fail the request
            console.error("[Notifications] Failed to send push notification:", error);
          });

          console.log(
            `[Notifications] Push notification queued for user ${recipient.id} (mode: ${contentMode})`
          );
        } else {
          console.log(
            `[Notifications] Notifications disabled for user ${recipient.id}`
          );
        }
      }
    } catch (error) {
      // Log error but don't fail the request
      console.error("[Notifications] Error processing notification:", error);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully",
        remaining: (rateLimit.remaining || 0) - 1,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in send message API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
