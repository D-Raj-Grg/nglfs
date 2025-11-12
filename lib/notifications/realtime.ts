/**
 * Real-time Notification Listener
 *
 * Listens to Supabase real-time events for new messages
 * and shows in-app toast notifications
 */

import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

// =====================================================
// Types
// =====================================================

interface NewMessagePayload {
  id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface RealtimeNotificationOptions {
  /** User ID to listen for messages */
  userId: string;

  /** Callback when new message received */
  onNewMessage?: (message: NewMessagePayload) => void;

  /** Whether to show toast notifications (default: true) */
  showToast?: boolean;

  /** Custom toast message */
  toastMessage?: (message: NewMessagePayload) => string;
}

// =====================================================
// Real-time Subscription Manager
// =====================================================

/**
 * Subscribe to real-time message notifications
 * Returns unsubscribe function
 */
export function subscribeToMessageNotifications(
  options: RealtimeNotificationOptions
): () => void {
  const { userId, onNewMessage, showToast = true, toastMessage } = options;

  const supabase = createClient();
  let channel: RealtimeChannel | null = null;

  try {
    // Create channel for messages table
    channel = supabase
      .channel(`messages:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[Realtime] New message received:', payload);

          const message = payload.new as NewMessagePayload;

          // Call callback
          if (onNewMessage) {
            onNewMessage(message);
          }

          // Show toast notification
          if (showToast) {
            const message_text = toastMessage
              ? toastMessage(message)
              : 'You have a new anonymous message!';

            toast.success(message_text, {
              description: 'Tap to view',
              action: {
                label: 'View',
                onClick: () => {
                  window.location.href = `/dashboard/messages/${message.id}`;
                },
              },
              duration: 5000,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
      });

    // Return unsubscribe function
    return () => {
      if (channel) {
        console.log('[Realtime] Unsubscribing from message notifications');
        supabase.removeChannel(channel);
      }
    };
  } catch (error) {
    console.error('[Realtime] Failed to subscribe to message notifications:', error);

    // Return no-op unsubscribe function
    return () => {};
  }
}

/**
 * Subscribe to multiple real-time events
 * Useful for dashboard that needs multiple subscriptions
 */
export function subscribeToAllNotifications(userId: string): () => void {
  const unsubscribeFunctions: Array<() => void> = [];

  // Subscribe to new messages
  const unsubscribeMessages = subscribeToMessageNotifications({
    userId,
    showToast: true,
    onNewMessage: (message) => {
      console.log('[Realtime] New message:', message.id);
      // Could trigger other side effects here
      // e.g., update unread count, play sound, etc.
    },
  });

  unsubscribeFunctions.push(unsubscribeMessages);

  // Return function that unsubscribes from all
  return () => {
    console.log('[Realtime] Unsubscribing from all notifications');
    unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
  };
}

// =====================================================
// Connection Status Monitoring
// =====================================================

/**
 * Monitor real-time connection status
 * Useful for showing connection indicators in UI
 */
export function monitorRealtimeStatus(
  onStatusChange: (status: 'connected' | 'disconnected' | 'reconnecting') => void
): () => void {
  const supabase = createClient();

  // Create a channel just for monitoring status
  const channel = supabase.channel('status-monitor').subscribe((status) => {
    console.log('[Realtime] Connection status:', status);

    switch (status) {
      case 'SUBSCRIBED':
        onStatusChange('connected');
        break;
      case 'CLOSED':
        onStatusChange('disconnected');
        break;
      case 'CHANNEL_ERROR':
      case 'TIMED_OUT':
        onStatusChange('reconnecting');
        break;
    }
  });

  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * Test real-time connection
 * Returns true if connection is working
 */
export async function testRealtimeConnection(): Promise<boolean> {
  const supabase = createClient();

  return new Promise((resolve) => {
    const channel = supabase.channel('test-connection').subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        supabase.removeChannel(channel);
        resolve(true);
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        supabase.removeChannel(channel);
        resolve(false);
      }
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      supabase.removeChannel(channel);
      resolve(false);
    }, 5000);
  });
}
