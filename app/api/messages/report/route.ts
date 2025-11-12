import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { REPORT_REASONS, type ReportReason } from "@/lib/constants/report-reasons";

/**
 * POST /api/messages/report
 * Report a message for abuse
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { message_id, reason, details } = body;

    // Validate inputs
    if (!message_id || typeof message_id !== "string") {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    if (!reason || !Object.values(REPORT_REASONS).includes(reason)) {
      return NextResponse.json(
        { error: "Valid reason is required" },
        { status: 400 }
      );
    }

    // Verify message belongs to user
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .select("id, sender_ip_hash, recipient_id")
      .eq("id", message_id)
      .eq("recipient_id", user.id)
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Create analytics event for the report
    const { error: analyticsError } = await supabase
      .from("message_analytics")
      .insert({
        user_id: user.id,
        message_id: message_id,
        event_type: "report",
        metadata: {
          reason,
          details: details || null,
          sender_ip_hash: message.sender_ip_hash,
        },
      });

    if (analyticsError) {
      console.error("Error logging report:", analyticsError);
      // Continue even if analytics fails
    }

    return NextResponse.json({
      success: true,
      message: "Message reported successfully",
      sender_ip_hash: message.sender_ip_hash, // Return for potential blocking
    });
  } catch (error) {
    console.error("Error in messages/report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
