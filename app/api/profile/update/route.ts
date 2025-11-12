import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateUsername, isReservedUsername } from "@/lib/validations/username";
import { z } from "zod";

/**
 * Profile update validation schema
 */
const profileUpdateSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  display_name: z.string().max(50).optional().nullable(),
  bio: z.string().max(150).optional().nullable(),
  avatar_url: z
    .string()
    .optional()
    .nullable()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (!val || val === "") return true; // Allow empty/null
        // Allow valid URLs (Supabase storage or other valid URLs)
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid avatar URL format" }
    ),
});

/**
 * PUT /api/profile/update
 * Update user profile
 *
 * Request body:
 * {
 *   "username"?: string,
 *   "display_name"?: string,
 *   "bio"?: string,
 *   "avatar_url"?: string
 * }
 *
 * Response:
 * {
 *   "profile": Profile object,
 *   "success": true
 * }
 */
export async function PUT(request: NextRequest) {
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

    // Get current profile
    const { data: currentProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (fetchError || !currentProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Validate with Zod
    const validationResult = profileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid profile data",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { username, display_name, bio, avatar_url } = validationResult.data;

    // Log incoming avatar_url for debugging
    console.log("[Profile Update] Incoming avatar_url:", avatar_url);

    // Prepare update object
    const updates: any = {};

    // Handle username update
    if (username && username !== currentProfile.username) {
      // Validate username format
      const usernameValidation = validateUsername(username);
      if (!usernameValidation.isValid) {
        return NextResponse.json(
          { error: usernameValidation.error },
          { status: 400 }
        );
      }

      // Check if username is reserved
      if (isReservedUsername(username)) {
        return NextResponse.json(
          { error: "This username is reserved and cannot be used" },
          { status: 400 }
        );
      }

      // Check if username is already taken
      const { data: existingUsername } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username.toLowerCase())
        .neq("id", user.id)
        .maybeSingle();

      if (existingUsername) {
        return NextResponse.json(
          { error: "This username is already taken" },
          { status: 400 }
        );
      }

      updates.username = username.toLowerCase();
    }

    // Handle other fields
    if (display_name !== undefined) {
      updates.display_name = display_name || null;
    }
    if (bio !== undefined) {
      updates.bio = bio || null;
    }
    if (avatar_url !== undefined) {
      updates.avatar_url = avatar_url || null;
      console.log("[Profile Update] Setting avatar_url in updates:", updates.avatar_url);
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    // Update profile
    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("[Profile Update] Error updating profile:", updateError);
      console.error("[Profile Update] Attempted updates:", updates);

      // Handle unique constraint violation
      if (updateError.code === "23505") {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    console.log("[Profile Update] Successfully updated profile:", {
      id: profile.id,
      username: profile.username,
      avatar_url: profile.avatar_url,
    });

    return NextResponse.json(
      {
        profile,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in update profile API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
