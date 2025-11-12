import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/block/list
 * Get list of blocked senders for authenticated user
 */
export async function GET(request: NextRequest) {
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

    // Fetch blocked senders (RLS ensures user can only see their own blocks)
    const { data: blocks, error: fetchError } = await supabase
      .from("blocked_senders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching blocks:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch blocked senders" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      blocks: blocks || [],
      count: blocks?.length || 0,
    });
  } catch (error) {
    console.error("Error in block/list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
