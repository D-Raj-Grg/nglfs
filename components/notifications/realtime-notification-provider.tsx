/**
 * Real-time Notification Provider
 *
 * React component that subscribes to real-time notifications
 * and manages the subscription lifecycle
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { subscribeToAllNotifications } from '@/lib/notifications/realtime';

interface RealtimeNotificationProviderProps {
  children: React.ReactNode;

  /** Whether to enable real-time notifications (default: true) */
  enabled?: boolean;
}

/**
 * Provider component for real-time notifications
 *
 * Usage:
 * ```tsx
 * <RealtimeNotificationProvider>
 *   <YourDashboard />
 * </RealtimeNotificationProvider>
 * ```
 */
export function RealtimeNotificationProvider({
  children,
  enabled = true,
}: RealtimeNotificationProviderProps) {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Don't subscribe if not enabled or no user
    if (!enabled || !user?.id) {
      return;
    }

    console.log('[RealtimeProvider] Subscribing to notifications for user:', user.id);

    // Subscribe to all notifications
    const unsubscribe = subscribeToAllNotifications(user.id);
    setIsSubscribed(true);

    // Cleanup on unmount or user change
    return () => {
      console.log('[RealtimeProvider] Cleaning up subscriptions');
      unsubscribe();
      setIsSubscribed(false);
    };
  }, [user?.id, enabled]);

  // Log subscription status for debugging
  useEffect(() => {
    if (isSubscribed) {
      console.log('[RealtimeProvider] Real-time notifications active');
    }
  }, [isSubscribed]);

  return <>{children}</>;
}

/**
 * Hook to check if real-time notifications are active
 */
export function useRealtimeStatus() {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(!!user?.id);
  }, [user?.id]);

  return { isActive };
}
