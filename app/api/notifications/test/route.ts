/**
 * POST /api/notifications/test
 *
 * Send a test notification to the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTestNotification } from '@/lib/notifications/server';
import type { SendTestNotificationResponse } from '@/lib/types/notifications.types';

export async function POST(req: NextRequest): Promise<NextResponse<SendTestNotificationResponse>> {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, sent: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Send test notification
    const result = await sendTestNotification(user.id);

    if (result.sent === 0) {
      return NextResponse.json({
        success: false,
        sent: false,
        error: 'No active subscriptions found. Please enable notifications first.',
      });
    }

    return NextResponse.json({
      success: true,
      sent: true,
    });
  } catch (error) {
    console.error('[Test Notification API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        sent: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
