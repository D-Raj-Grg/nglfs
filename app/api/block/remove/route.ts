import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * DELETE /api/block/remove
 * Unblock a sender by block ID
 */
export async function DELETE(request: NextRequest) {
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
    const { block_id } = body;

    // Validate input
    if (!block_id || typeof block_id !== "string") {
      return NextResponse.json(
        { error: "Block ID is required" },
        { status: 400 }
      );
    }

    // Delete block (RLS ensures user can only delete their own blocks)
    const { error: deleteError } = await supabase
      .from("blocked_senders")
      .delete()
      .eq("id", block_id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting block:", deleteError);
      return NextResponse.json(
        { error: "Failed to unblock sender" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sender unblocked successfully",
    });
  } catch (error) {
    console.error("Error in block/remove:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
