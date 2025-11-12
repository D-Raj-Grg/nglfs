/**
 * GET/PUT /api/notifications/preferences
 *
 * Get or update notification preferences for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type {
  NotificationPreferences,
  UpdatePreferencesRequest,
  UpdatePreferencesResponse,
} from '@/lib/types/notifications.types';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/lib/types/notifications.types';

/**
 * GET - Fetch user's notification preferences
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's profile with preferences
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('[Preferences API] Failed to fetch preferences:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }

    // Return preferences or defaults
    const preferences: NotificationPreferences =
      profile.notification_preferences || DEFAULT_NOTIFICATION_PREFERENCES;

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error('[Preferences API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update user's notification preferences
 */
export async function PUT(req: NextRequest): Promise<NextResponse<UpdatePreferencesResponse>> {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: UpdatePreferencesRequest = await req.json();

    if (!body.preferences) {
      return NextResponse.json(
        { success: false, error: 'Preferences are required' },
        { status: 400 }
      );
    }

    // Get current preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', user.id)
      .single();

    const currentPreferences: NotificationPreferences =
      profile?.notification_preferences || DEFAULT_NOTIFICATION_PREFERENCES;

    // Merge with new preferences
    const updatedPreferences: NotificationPreferences = {
      ...currentPreferences,
      ...body.preferences,
    };

    // Update in database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ notification_preferences: updatedPreferences })
      .eq('id', user.id);

    if (updateError) {
      console.error('[Preferences API] Failed to update preferences:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences,
    });
  } catch (error) {
    console.error('[Preferences API] PUT Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
