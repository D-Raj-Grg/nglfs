/**
 * POST /api/notifications/unsubscribe
 *
 * Remove a push notification subscription for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { removeSubscription } from '@/lib/notifications/server';
import type { UnsubscribeRequest, UnsubscribeResponse } from '@/lib/types/notifications.types';

export async function POST(req: NextRequest): Promise<NextResponse<UnsubscribeResponse>> {
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
    const body: UnsubscribeRequest = await req.json();

    if (!body.endpoint) {
      return NextResponse.json(
        { success: false, error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    // Remove subscription
    const result = await removeSubscription(user.id, body.endpoint);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to remove subscription' },
        { status: 500 }
      );
    }

    // Update user's notification preferences to disabled
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        notification_preferences: {
          enabled: false,
          show_preview: false,
          prompt_shown: true,
          permission_granted_at: null,
        },
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[Unsubscribe API] Failed to update preferences:', updateError);
      // Don't fail the request, subscription was removed
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Unsubscribe API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
