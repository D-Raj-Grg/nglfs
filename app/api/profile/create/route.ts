import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateUsername, isReservedUsername } from "@/lib/validations/username";
import { z } from "zod";

/**
 * Profile creation validation schema
 */
const profileSchema = z.object({
  username: z.string().min(3).max(20),
  display_name: z.string().max(50).optional(),
  bio: z.string().max(150).optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
});

/**
 * POST /api/profile/create
 * Create a new user profile
 *
 * Request body:
 * {
 *   "username": string (required, 3-20 chars, alphanumeric + underscore),
 *   "display_name"?: string (optional, max 50 chars),
 *   "bio"?: string (optional, max 150 chars),
 *   "avatar_url"?: string (optional, valid URL)
 * }
 *
 * Response:
 * {
 *   "profile": Profile object,
 *   "success": true
 * }
 */
export async function POST(request: NextRequest) {
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

    // Check if user already has a profile
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Validate with Zod
    const validationResult = profileSchema.safeParse(body);
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
      .maybeSingle();

    if (existingUsername) {
      return NextResponse.json(
        { error: "This username is already taken" },
        { status: 400 }
      );
    }

    // Create profile
    const { data: profile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username: username.toLowerCase(),
        display_name: display_name || username,
        bio: bio || null,
        avatar_url: avatar_url || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating profile:", insertError);

      // Handle unique constraint violation
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        profile,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in create profile API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
