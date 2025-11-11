import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  validateUsername,
  isReservedUsername,
  generateUsernameSuggestions,
} from "@/lib/validations/username";

/**
 * POST /api/profile/check-username
 * Check if a username is available
 *
 * Request body:
 * {
 *   "username": string
 * }
 *
 * Response:
 * {
 *   "available": boolean,
 *   "error"?: string,
 *   "suggestions"?: string[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    // Validate request
    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Validate username format
    const validation = validateUsername(username);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          available: false,
          error: validation.error,
        },
        { status: 200 }
      );
    }

    // Check if username is reserved
    if (isReservedUsername(username)) {
      const suggestions = generateUsernameSuggestions(username);
      return NextResponse.json(
        {
          available: false,
          error: "This username is reserved and cannot be used",
          suggestions,
        },
        { status: 200 }
      );
    }

    // Check if username exists in database
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error("Error checking username availability:", error);
      return NextResponse.json(
        { error: "Failed to check username availability" },
        { status: 500 }
      );
    }

    // If data exists, username is taken
    if (data) {
      const suggestions = generateUsernameSuggestions(username);
      return NextResponse.json(
        {
          available: false,
          error: "This username is already taken",
          suggestions,
        },
        { status: 200 }
      );
    }

    // Username is available
    return NextResponse.json(
      {
        available: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in check-username API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
