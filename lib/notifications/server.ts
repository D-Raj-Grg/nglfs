/**
 * Server-Side Notification Library
 *
 * Handles sending push notifications from the server using web-push
 * IMPORTANT: This file should only be imported in API routes (server-side)
 */

import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';
import type {
  PushSubscriptionData,
  NotificationContentMode,
  NotificationDisplayOptions,
  NotificationPayload,
} from '@/lib/types/notifications.types';
import {
  DEFAULT_NOTIFICATION_ICON,
  DEFAULT_NOTIFICATION_BADGE,
  NOTIFICATION_TITLES,
  NOTIFICATION_BODIES,
  NOTIFICATION_PREVIEW_MAX_LENGTH,
  NOTIFICATION_TAG_PREFIX,
} from './constants';

// =====================================================
// VAPID Configuration
// =====================================================

/**
 * Initialize web-push with VAPID keys
 * Call this once on server startup
 */
export function initializeWebPush(): void {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@nglfs.com';

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error('[Notifications] VAPID keys not configured');
    throw new Error('VAPID keys not configured in environment variables');
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  console.log('[Notifications] Web push initialized');
}

// Initialize on module load
try {
  initializeWebPush();
} catch (error) {
  console.error('[Notifications] Failed to initialize web push:', error);
}

// =====================================================
// Subscription Management
// =====================================================

/**
 * Get all push subscriptions for a user
 */
export async function getUserSubscriptions(userId: string): Promise<PushSubscriptionData[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('subscription_data')
    .eq('user_id', userId);

  if (error) {
    console.error('[Notifications] Failed to get user subscriptions:', error);
    return [];
  }

  return data.map((row) => row.subscription_data as PushSubscriptionData);
}

/**
 * Save a push subscription for a user
 */
export async function saveSubscription(
  userId: string,
  subscription: PushSubscriptionData
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
  const supabase = await createClient();

  // Check if subscription already exists (by endpoint)
  const { data: existing } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('endpoint', subscription.endpoint)
    .single();

  if (existing) {
    // Update existing subscription
    const { error } = await supabase
      .from('push_subscriptions')
      .update({
        subscription_data: subscription,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) {
      console.error('[Notifications] Failed to update subscription:', error);
      return { success: false, error: error.message };
    }

    return { success: true, subscriptionId: existing.id };
  }

  // Insert new subscription
  const { data, error } = await supabase
    .from('push_subscriptions')
    .insert({
      user_id: userId,
      endpoint: subscription.endpoint,
      subscription_data: subscription,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[Notifications] Failed to save subscription:', error);
    return { success: false, error: error.message };
  }

  return { success: true, subscriptionId: data.id };
}

/**
 * Remove a subscription by endpoint
 */
export async function removeSubscription(
  userId: string,
  endpoint: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('endpoint', endpoint);

  if (error) {
    console.error('[Notifications] Failed to remove subscription:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// =====================================================
// Notification Sending
// =====================================================

/**
 * Send a push notification to a single subscription
 */
async function sendPushToSubscription(
  subscription: PushSubscriptionData,
  payload: NotificationDisplayOptions
): Promise<{ success: boolean; error?: string }> {
  try {
    // Convert our subscription format to web-push format
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    };

    // Send notification
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));

    console.log('[Notifications] Push sent successfully to:', subscription.endpoint);
    return { success: true };
  } catch (error: unknown) {
    console.error('[Notifications] Failed to send push:', error);

    // Handle expired subscriptions (status code 410)
    if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 410) {
      console.log('[Notifications] Subscription expired:', subscription.endpoint);
      // TODO: Remove expired subscription from database
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send push notification',
    };
  }
}

/**
 * Build notification payload for a new message
 */
function buildMessageNotificationPayload(
  messageId: string,
  messageContent: string,
  mode: NotificationContentMode,
  appUrl: string
): NotificationDisplayOptions {
  const timestamp = new Date().toISOString();

  if (mode === 'preview') {
    // Show message preview
    const preview =
      messageContent.length > NOTIFICATION_PREVIEW_MAX_LENGTH
        ? messageContent.substring(0, NOTIFICATION_PREVIEW_MAX_LENGTH) + '...'
        : messageContent;

    return {
      title: NOTIFICATION_TITLES.NEW_MESSAGE_PREVIEW,
      body: preview,
      icon: `${appUrl}${DEFAULT_NOTIFICATION_ICON}`,
      badge: `${appUrl}${DEFAULT_NOTIFICATION_BADGE}`,
      tag: `${NOTIFICATION_TAG_PREFIX}${messageId}`,
      data: {
        type: 'message',
        mode: 'preview',
        messageId,
        content: preview,
        timestamp,
      },
      requireInteraction: false,
    };
  } else {
    // Private mode - no preview
    return {
      title: NOTIFICATION_TITLES.NEW_MESSAGE_PRIVATE,
      body: NOTIFICATION_BODIES.NEW_MESSAGE_PRIVATE,
      icon: `${appUrl}${DEFAULT_NOTIFICATION_ICON}`,
      badge: `${appUrl}${DEFAULT_NOTIFICATION_BADGE}`,
      tag: `${NOTIFICATION_TAG_PREFIX}${messageId}`,
      data: {
        type: 'message',
        mode: 'private',
        messageId,
        timestamp,
      },
      requireInteraction: false,
    };
  }
}

/**
 * Send a message notification to a user
 *
 * @param userId - The user to notify
 * @param messageId - ID of the message
 * @param messageContent - Content of the message
 * @param mode - 'preview' to show content, 'private' for generic alert
 */
export async function sendMessageNotification(
  userId: string,
  messageId: string,
  messageContent: string,
  mode: NotificationContentMode = 'private'
): Promise<{ sent: number; failed: number }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Get user's subscriptions
  const subscriptions = await getUserSubscriptions(userId);

  if (subscriptions.length === 0) {
    console.log('[Notifications] No subscriptions found for user:', userId);
    return { sent: 0, failed: 0 };
  }

  // Build notification payload
  const payload = buildMessageNotificationPayload(messageId, messageContent, mode, appUrl);

  // Send to all subscriptions
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushToSubscription(sub, payload))
  );

  // Count successes and failures
  let sent = 0;
  let failed = 0;

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.success) {
      sent++;
    } else {
      failed++;
    }
  }

  console.log('[Notifications] Message notification sent:', { userId, sent, failed });

  return { sent, failed };
}

/**
 * Send a test notification to a user
 */
export async function sendTestNotification(userId: string): Promise<{ sent: number; failed: number }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Get user's subscriptions
  const subscriptions = await getUserSubscriptions(userId);

  if (subscriptions.length === 0) {
    console.log('[Notifications] No subscriptions found for user:', userId);
    return { sent: 0, failed: 0 };
  }

  // Build test notification payload
  const payload: NotificationDisplayOptions = {
    title: NOTIFICATION_TITLES.TEST_NOTIFICATION,
    body: NOTIFICATION_BODIES.TEST_NOTIFICATION,
    icon: `${appUrl}${DEFAULT_NOTIFICATION_ICON}`,
    badge: `${appUrl}${DEFAULT_NOTIFICATION_BADGE}`,
    tag: 'nglfs-test',
    data: {
      type: 'message',
      mode: 'private',
      messageId: 'test',
      timestamp: new Date().toISOString(),
    },
    requireInteraction: false,
  };

  // Send to all subscriptions
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushToSubscription(sub, payload))
  );

  // Count successes and failures
  let sent = 0;
  let failed = 0;

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.success) {
      sent++;
    } else {
      failed++;
    }
  }

  console.log('[Notifications] Test notification sent:', { userId, sent, failed });

  return { sent, failed };
}

// =====================================================
// Cleanup
// =====================================================

/**
 * Remove expired subscriptions from the database
 * Should be called periodically (e.g., daily cron job)
 */
export async function cleanupExpiredSubscriptions(): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('cleanup_expired_subscriptions');

  if (error) {
    console.error('[Notifications] Failed to cleanup expired subscriptions:', error);
    return 0;
  }

  console.log('[Notifications] Cleaned up expired subscriptions:', data);
  return data || 0;
}
