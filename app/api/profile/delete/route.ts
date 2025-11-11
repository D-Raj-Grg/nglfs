import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * DELETE /api/profile/delete
 * Delete user account and all associated data
 *
 * Response: { success: boolean } or { error: string }
 */
export async function DELETE(request: NextRequest) {
  try {
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

    // Get user's profile to find avatar path
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    // Delete avatar from storage if it exists
    if (profile?.avatar_url) {
      const path = profile.avatar_url.split("/storage/v1/object/public/avatars/")[1];
      if (path) {
        await supabase.storage.from("avatars").remove([path]);
      }
    }

    // Delete profile (this will cascade delete messages, analytics, etc. due to FK constraints)
    const { error: deleteError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (deleteError) {
      console.error("Error deleting profile:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete profile data" },
        { status: 500 }
      );
    }

    // Delete auth user (must be done after profile deletion)
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(
      user.id
    );

    if (authDeleteError) {
      console.error("Error deleting auth user:", authDeleteError);
      return NextResponse.json(
        { error: "Failed to delete user account" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in delete-account API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
