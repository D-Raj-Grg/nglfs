import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/messages/[id]
 * Fetch a single message with full tracking details
 *
 * Security: Only returns message if it belongs to authenticated user
 * Response: { message: Message, metadata: MessageMetadata } or { error: string }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's profile to get their ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Fetch message with all tracking fields (including enhanced fields)
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .select(
        `
        id,
        content,
        is_read,
        is_flagged,
        created_at,
        read_at,
        sender_ip_hash,
        sender_ip_raw,
        sender_device_type,
        sender_browser,
        sender_os,
        sender_timezone,
        sender_language,
        sender_referrer_platform,
        sender_utm_source,
        sender_utm_campaign,
        sender_screen_resolution,
        sender_viewport_size,
        sender_color_depth,
        sender_pixel_ratio,
        sender_touch_support,
        sender_connection_type
      `
      )
      .eq("id", id)
      .eq("recipient_id", profile.id)
      .single();

    if (messageError || !message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Get additional context: count messages from same sender
    const { count: senderMessageCount } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", profile.id)
      .eq("sender_ip_hash", message.sender_ip_hash);

    // Check if sender is blocked
    const { data: blockedSender } = await supabase
      .from("blocked_senders")
      .select("id, reason, created_at")
      .eq("user_id", profile.id)
      .eq("blocked_ip_hash", message.sender_ip_hash)
      .maybeSingle();

    // Mark message as read if it wasn't already
    if (!message.is_read) {
      await supabase
        .from("messages")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", id);
    }

    return NextResponse.json({
      message: {
        ...message,
        is_read: true, // Update in response since we just marked it as read
        read_at: message.read_at || new Date().toISOString(),
      },
      metadata: {
        sender_message_count: senderMessageCount || 1,
        is_sender_blocked: !!blockedSender,
        blocked_reason: blockedSender?.reason || null,
        blocked_at: blockedSender?.created_at || null,
      },
    });
  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/messages/[id]
 * Delete a message
 *
 * Response: { success: boolean } or { error: string }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Delete message (RLS ensures user can only delete their own messages)
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", id)
      .eq("recipient_id", user.id); // Ensure user owns this message

    if (error) {
      console.error("Error deleting message:", error);
      return NextResponse.json(
        { error: "Failed to delete message" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in message/delete API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
