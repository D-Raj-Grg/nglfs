/**
 * Analytics Database Utilities
 * Server-side functions for tracking events and generating analytics
 * Supports message analytics, profile visits, and dashboard metrics
 */

import { createClient } from '@/lib/supabase/server';
import type {
  MessageAnalytic,
  MessageAnalyticInsert,
  LinkVisit,
  LinkVisitInsert,
  AnalyticsEventType,
} from '@/lib/types/database.types';

/**
 * Track an analytics event
 * @param eventData - Event data to track
 * @returns Created analytics record or null if error
 */
export async function trackEvent(
  eventData: MessageAnalyticInsert
): Promise<MessageAnalytic | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('message_analytics')
    .insert(eventData)
    .select()
    .single();

  if (error) {
    console.error('Error tracking analytics event:', error);
    return null;
  }

  return data;
}

/**
 * Track message received event
 * @param userId - Recipient user ID
 * @param messageId - Message ID
 * @param metadata - Additional metadata
 * @returns Created analytics record or null
 */
export async function trackMessageReceived(
  userId: string,
  messageId: string,
  metadata: Record<string, any> = {}
): Promise<MessageAnalytic | null> {
  return trackEvent({
    user_id: userId,
    message_id: messageId,
    event_type: 'message_received',
    metadata,
  });
}

/**
 * Track message read event
 * @param userId - Recipient user ID
 * @param messageId - Message ID
 * @param metadata - Additional metadata (e.g., read time)
 * @returns Created analytics record or null
 */
export async function trackMessageRead(
  userId: string,
  messageId: string,
  metadata: Record<string, any> = {}
): Promise<MessageAnalytic | null> {
  return trackEvent({
    user_id: userId,
    message_id: messageId,
    event_type: 'message_read',
    metadata,
  });
}

/**
 * Track profile view event
 * @param userId - Profile owner user ID
 * @param metadata - Additional metadata (e.g., referrer)
 * @returns Created analytics record or null
 */
export async function trackProfileView(
  userId: string,
  metadata: Record<string, any> = {}
): Promise<MessageAnalytic | null> {
  return trackEvent({
    user_id: userId,
    event_type: 'profile_viewed',
    metadata,
  });
}

/**
 * Track link shared event
 * @param userId - Profile owner user ID
 * @param metadata - Additional metadata (e.g., platform)
 * @returns Created analytics record or null
 */
export async function trackLinkShared(
  userId: string,
  metadata: Record<string, any> = {}
): Promise<MessageAnalytic | null> {
  return trackEvent({
    user_id: userId,
    event_type: 'link_shared',
    metadata,
  });
}

/**
 * Track profile visit (separate table for detailed visit tracking)
 * @param visitData - Visit data including profile_id, visitor_ip_hash, referrer
 * @returns Created visit record or null
 */
export async function trackProfileVisit(
  visitData: LinkVisitInsert
): Promise<LinkVisit | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('link_visits')
    .insert(visitData)
    .select()
    .single();

  if (error) {
    // Might fail due to unique constraint (hourly duplicate prevention)
    // This is expected behavior, not an error
    if (error.code === '23505') {
      return null;
    }
    console.error('Error tracking profile visit:', error);
    return null;
  }

  return data;
}

/**
 * Get analytics events for user
 * @param userId - User ID
 * @param options - Filtering and pagination options
 * @returns Array of analytics events
 */
export async function getUserAnalytics(
  userId: string,
  options: {
    eventType?: AnalyticsEventType;
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<MessageAnalytic[]> {
  const supabase = await createClient();
  const { eventType, limit = 100, offset = 0, startDate, endDate } = options;

  let query = supabase
    .from('message_analytics')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (eventType) {
    query = query.eq('event_type', eventType);
  }

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user analytics:', error);
    return [];
  }

  return data || [];
}

/**
 * Get profile visit statistics
 * @param profileId - Profile ID
 * @param options - Date range options
 * @returns Visit statistics
 */
export async function getProfileVisitStats(
  profileId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<{
  total: number;
  unique: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}> {
  const supabase = await createClient();
  const { startDate, endDate } = options;

  // Total visits
  let totalQuery = supabase
    .from('link_visits')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profileId);

  if (startDate) {
    totalQuery = totalQuery.gte('created_at', startDate.toISOString());
  }
  if (endDate) {
    totalQuery = totalQuery.lte('created_at', endDate.toISOString());
  }

  const { count: total } = await totalQuery;

  // Unique visitors (count distinct IP hashes)
  const { data: uniqueData } = await supabase
    .from('link_visits')
    .select('visitor_ip_hash')
    .eq('profile_id', profileId);

  const unique = new Set(uniqueData?.map((v) => v.visitor_ip_hash)).size;

  // Today's visits
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count: today } = await supabase
    .from('link_visits')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .gte('created_at', todayStart.toISOString());

  // This week's visits
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);
  const { count: thisWeek } = await supabase
    .from('link_visits')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .gte('created_at', weekStart.toISOString());

  // This month's visits
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const { count: thisMonth } = await supabase
    .from('link_visits')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .gte('created_at', monthStart.toISOString());

  return {
    total: total || 0,
    unique,
    today: today || 0,
    thisWeek: thisWeek || 0,
    thisMonth: thisMonth || 0,
  };
}

/**
 * Get daily visit trend for profile
 * @param profileId - Profile ID
 * @param days - Number of days to fetch (default 30)
 * @returns Array of daily visit counts
 */
export async function getDailyVisitTrend(
  profileId: string,
  days: number = 30
): Promise<Array<{ date: string; count: number }>> {
  const supabase = await createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('link_visits')
    .select('created_at')
    .eq('profile_id', profileId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching daily visit trend:', error);
    return [];
  }

  // Group by date
  const dailyCounts: Record<string, number> = {};
  data?.forEach((visit) => {
    const date = new Date(visit.created_at).toISOString().split('T')[0];
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });

  // Fill in missing dates with 0
  const result: Array<{ date: string; count: number }> = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    const dateStr = date.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      count: dailyCounts[dateStr] || 0,
    });
  }

  return result;
}

/**
 * Get top referrers for profile
 * @param profileId - Profile ID
 * @param limit - Number of top referrers to return
 * @returns Array of referrers with counts
 */
export async function getTopReferrers(
  profileId: string,
  limit: number = 10
): Promise<Array<{ referrer: string; count: number }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('link_visits')
    .select('referrer')
    .eq('profile_id', profileId)
    .not('referrer', 'is', null);

  if (error) {
    console.error('Error fetching top referrers:', error);
    return [];
  }

  // Count referrers
  const referrerCounts: Record<string, number> = {};
  data?.forEach((visit) => {
    if (visit.referrer) {
      referrerCounts[visit.referrer] = (referrerCounts[visit.referrer] || 0) + 1;
    }
  });

  // Sort and limit
  return Object.entries(referrerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([referrer, count]) => ({ referrer, count }));
}

/**
 * Get dashboard analytics overview
 * @param userId - User ID
 * @returns Comprehensive analytics overview
 */
export async function getDashboardAnalytics(userId: string): Promise<{
  messages: {
    total: number;
    unread: number;
    today: number;
    thisWeek: number;
  };
  visits: {
    total: number;
    unique: number;
    today: number;
    thisWeek: number;
  };
  engagement: {
    readRate: number;
    averageMessagesPerDay: number;
  };
}> {
  const supabase = await createClient();

  // Message stats
  const { count: totalMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId);

  const { count: unreadMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('is_read', false);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count: todayMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .gte('created_at', todayStart.toISOString());

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const { count: weekMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .gte('created_at', weekStart.toISOString());

  // Visit stats
  const visitStats = await getProfileVisitStats(userId);

  // Engagement metrics
  const readRate =
    totalMessages && totalMessages > 0
      ? ((totalMessages - (unreadMessages || 0)) / totalMessages) * 100
      : 0;

  // Get account creation date for average calculation
  const { data: profile } = await supabase
    .from('profiles')
    .select('created_at')
    .eq('id', userId)
    .single();

  const daysSinceCreation = profile
    ? Math.max(
        1,
        Math.floor(
          (Date.now() - new Date(profile.created_at).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 1;

  const averageMessagesPerDay = (totalMessages || 0) / daysSinceCreation;

  return {
    messages: {
      total: totalMessages || 0,
      unread: unreadMessages || 0,
      today: todayMessages || 0,
      thisWeek: weekMessages || 0,
    },
    visits: visitStats,
    engagement: {
      readRate: Math.round(readRate * 10) / 10, // Round to 1 decimal
      averageMessagesPerDay: Math.round(averageMessagesPerDay * 10) / 10,
    },
  };
}
