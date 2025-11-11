import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "crypto";

/**
 * Message send validation schema
 */
const messageSendSchema = z.object({
  recipient_username: z.string().min(3).max(20),
  content: z.string().min(1).max(500),
});

/**
 * Hash IP address for privacy (SHA-256)
 */
function hashIP(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  // Try to get IP from various headers (for proxies, load balancers)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback to a placeholder (should not happen in production)
  return "unknown";
}

/**
 * Check rate limit for anonymous message sending
 * Limit: 3 messages per IP per hour
 */
async function checkRateLimit(
  supabase: any,
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
  const limit = 3;

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
  supabase: any,
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
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { recipient_username, content } = validationResult.data;

    // Get sender IP and hash it
    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);

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
          error: `Rate limit exceeded. You can send ${3} messages per hour. Try again after ${resetTime}.`,
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      );
    }

    // Insert message
    const { data: message, error: insertError } = await supabase
      .from("messages")
      .insert({
        recipient_id: recipient.id,
        content: content.trim(),
        sender_ip_hash: ipHash,
        is_read: false,
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
