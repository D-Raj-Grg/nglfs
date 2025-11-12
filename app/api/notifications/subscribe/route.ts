/**
 * POST /api/notifications/subscribe
 *
 * Save a push notification subscription for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { saveSubscription } from '@/lib/notifications/server';
import type { SubscribeRequest, SubscribeResponse } from '@/lib/types/notifications.types';

export async function POST(req: NextRequest): Promise<NextResponse<SubscribeResponse>> {
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
    const body: SubscribeRequest = await req.json();

    if (!body.subscription || !body.subscription.endpoint) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Save subscription
    const result = await saveSubscription(user.id, body.subscription);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to save subscription' },
        { status: 500 }
      );
    }

    // Update user's notification preferences to enabled
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        notification_preferences: {
          enabled: true,
          show_preview: false,
          prompt_shown: true,
          permission_granted_at: new Date().toISOString(),
        },
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[Subscribe API] Failed to update preferences:', updateError);
      // Don't fail the request, subscription was saved
    }

    return NextResponse.json({
      success: true,
      subscriptionId: result.subscriptionId,
    });
  } catch (error) {
    console.error('[Subscribe API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
