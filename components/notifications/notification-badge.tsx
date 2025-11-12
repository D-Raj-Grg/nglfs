/**
 * Notification Badge Component
 *
 * Shows unread message count with real-time updates
 * Can be used in sidebars, navigation, etc.
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { createClient } from '@/lib/supabase/client';

interface NotificationBadgeProps {
  /** Additional CSS classes */
  className?: string;

  /** Show as dot instead of number */
  showDot?: boolean;
}

/**
 * Notification Badge Component
 *
 * Usage:
 * ```tsx
 * <NotificationBadge />
 * <NotificationBadge showDot />
 * <NotificationBadge className="custom-class" />
 * ```
 */
export function NotificationBadge({ className = '', showDot = false }: NotificationBadgeProps) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    // Fetch initial unread count
    fetchUnreadCount();

    // Subscribe to real-time updates
    const supabase = createClient();
    const channel = supabase
      .channel(`unread-count:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          // Refetch count when messages change
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  async function fetchUnreadCount() {
    if (!user?.id) return;

    try {
      const supabase = createClient();
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('[NotificationBadge] Failed to fetch unread count:', error);
    }
  }

  // Don't show badge if no unread messages
  if (unreadCount === 0) {
    return null;
  }

  if (showDot) {
    // Show as dot
    return (
      <span
        className={`inline-block w-2 h-2 bg-red-500 rounded-full ${className}`}
        aria-label={`${unreadCount} unread messages`}
      />
    );
  }

  // Show as number badge
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-red-500 rounded-full ${className}`}
      aria-label={`${unreadCount} unread messages`}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}

/**
 * Hook to get unread message count
 */
export function useUnreadCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setCount(0);
      setIsLoading(false);
      return;
    }

    fetchCount();

    // Subscribe to real-time updates
    const supabase = createClient();
    const channel = supabase
      .channel(`unread-count-hook:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  async function fetchCount() {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (!error && count !== null) {
        setCount(count);
      }
    } catch (error) {
      console.error('[useUnreadCount] Failed to fetch count:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return { count, isLoading };
}
