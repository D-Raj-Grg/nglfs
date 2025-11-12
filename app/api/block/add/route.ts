import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BLOCK_REASONS, type BlockReason } from "@/lib/utils/blocking";

/**
 * POST /api/block/add
 * Block a sender by IP hash
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
    const { ip_hash, reason, message_id } = body;

    // Validate inputs
    if (!ip_hash || typeof ip_hash !== "string") {
      return NextResponse.json(
        { error: "IP hash is required" },
        { status: 400 }
      );
    }

    // Validate reason if provided
    if (reason && !Object.values(BLOCK_REASONS).includes(reason)) {
      return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    }

    // Check if already blocked
    const { data: existing, error: checkError } = await supabase
      .from("blocked_senders")
      .select("id")
      .eq("user_id", user.id)
      .eq("blocked_ip_hash", ip_hash)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing block:", checkError);
      return NextResponse.json(
        { error: "Failed to check existing blocks" },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: "This sender is already blocked" },
        { status: 400 }
      );
    }

    // Create block record
    const { data: blockData, error: blockError } = await supabase
      .from("blocked_senders")
      .insert({
        user_id: user.id,
        blocked_ip_hash: ip_hash,
        reason: reason || BLOCK_REASONS.OTHER,
        blocked_identifier: message_id
          ? `Message ${message_id.substring(0, 8)}`
          : `Sender ${ip_hash.substring(0, 8)}`,
      })
      .select()
      .single();

    if (blockError) {
      console.error("Error creating block:", blockError);
      return NextResponse.json(
        { error: "Failed to block sender" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      block: blockData,
      message: "Sender blocked successfully",
    });
  } catch (error) {
    console.error("Error in block/add:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
