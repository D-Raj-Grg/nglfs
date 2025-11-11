/**
 * Message Database Utilities
 * Server-side functions for message CRUD operations
 * Includes IP hashing and rate limiting helpers
 */

import { createClient } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import type {
  Message,
  MessageInsert,
  MessageUpdate,
  MessageWithRecipient,
} from '@/lib/types/database.types';

/**
 * Hash IP address using SHA-256 for privacy
 * @param ipAddress - Raw IP address
 * @returns SHA-256 hash of IP address
 */
export function hashIpAddress(ipAddress: string): string {
  return createHash('sha256').update(ipAddress).digest('hex');
}

/**
 * Get messages for a recipient (authenticated user)
 * @param recipientId - UUID of recipient
 * @param options - Pagination and filtering options
 * @returns Array of messages
 */
export async function getMessagesForRecipient(
  recipientId: string,
  options: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
    flaggedOnly?: boolean;
  } = {}
): Promise<Message[]> {
  const supabase = await createClient();
  const { limit = 50, offset = 0, unreadOnly = false, flaggedOnly = false } = options;

  let query = supabase
    .from('messages')
    .select('*')
    .eq('recipient_id', recipientId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  if (flaggedOnly) {
    query = query.eq('is_flagged', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
}

/**
 * Get single message by ID (with RLS check)
 * @param messageId - UUID of message
 * @returns Message data or null
 */
export async function getMessageById(messageId: string): Promise<Message | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .single();

  if (error) {
    console.error('Error fetching message:', error);
    return null;
  }

  return data;
}

/**
 * Create a new message (anonymous sending)
 * @param messageData - Message data including recipient_id, content, sender_ip_hash
 * @returns Created message or null if error
 */
export async function createMessage(
  messageData: MessageInsert
): Promise<Message | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select()
    .single();

  if (error) {
    console.error('Error creating message:', error);
    return null;
  }

  return data;
}

/**
 * Mark message as read
 * @param messageId - UUID of message
 * @returns Updated message or null if error
 */
export async function markMessageAsRead(messageId: string): Promise<Message | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .select()
    .single();

  if (error) {
    console.error('Error marking message as read:', error);
    return null;
  }

  return data;
}

/**
 * Mark multiple messages as read
 * @param messageIds - Array of message UUIDs
 * @returns true if successful
 */
export async function markMessagesAsRead(messageIds: string[]): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .in('id', messageIds);

  if (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }

  return true;
}

/**
 * Toggle flag status on message
 * @param messageId - UUID of message
 * @param flagged - New flagged status
 * @returns Updated message or null if error
 */
export async function toggleMessageFlag(
  messageId: string,
  flagged: boolean
): Promise<Message | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('messages')
    .update({ is_flagged: flagged })
    .eq('id', messageId)
    .select()
    .single();

  if (error) {
    console.error('Error toggling message flag:', error);
    return null;
  }

  return data;
}

/**
 * Delete message (soft delete - recipient only)
 * @param messageId - UUID of message
 * @returns true if successful
 */
export async function deleteMessage(messageId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    console.error('Error deleting message:', error);
    return false;
  }

  return true;
}

/**
 * Delete multiple messages
 * @param messageIds - Array of message UUIDs
 * @returns true if successful
 */
export async function deleteMessages(messageIds: string[]): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('messages')
    .delete()
    .in('id', messageIds);

  if (error) {
    console.error('Error deleting messages:', error);
    return false;
  }

  return true;
}

/**
 * Get unread message count for recipient
 * @param recipientId - UUID of recipient
 * @returns Number of unread messages
 */
export async function getUnreadMessageCount(recipientId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', recipientId)
    .eq('is_read', false);

  if (error) {
    console.error('Error counting unread messages:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Check rate limit for IP address
 * @param ipHash - SHA-256 hash of IP address
 * @param recipientId - UUID of recipient (optional, for per-recipient rate limiting)
 * @param limitPerHour - Maximum messages allowed per hour (default 3)
 * @returns true if rate limit exceeded, false if allowed
 */
export async function checkRateLimit(
  ipHash: string,
  recipientId?: string,
  limitPerHour: number = 3
): Promise<boolean> {
  const supabase = await createClient();

  // Get messages from this IP in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  let query = supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('sender_ip_hash', ipHash)
    .gte('created_at', oneHourAgo);

  // Optionally filter by recipient
  if (recipientId) {
    query = query.eq('recipient_id', recipientId);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error checking rate limit:', error);
    // On error, allow (fail open) but log it
    return false;
  }

  return (count || 0) >= limitPerHour;
}

/**
 * Check if IP is blocked by recipient
 * @param recipientId - UUID of recipient
 * @param ipHash - SHA-256 hash of IP address
 * @returns true if blocked, false if allowed
 */
export async function isIpBlocked(
  recipientId: string,
  ipHash: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blocked_senders')
    .select('id')
    .eq('user_id', recipientId)
    .eq('blocked_ip_hash', ipHash)
    .maybeSingle();

  if (error) {
    console.error('Error checking blocked status:', error);
    return false;
  }

  return data !== null;
}

/**
 * Get message statistics for recipient
 * @param recipientId - UUID of recipient
 * @returns Statistics object
 */
export async function getMessageStats(recipientId: string): Promise<{
  total: number;
  unread: number;
  flagged: number;
  today: number;
  thisWeek: number;
}> {
  const supabase = await createClient();

  // Get total count
  const { count: total } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', recipientId);

  // Get unread count
  const { count: unread } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', recipientId)
    .eq('is_read', false);

  // Get flagged count
  const { count: flagged } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', recipientId)
    .eq('is_flagged', true);

  // Get today's count
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count: today } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', recipientId)
    .gte('created_at', todayStart.toISOString());

  // Get this week's count
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);
  const { count: thisWeek } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', recipientId)
    .gte('created_at', weekStart.toISOString());

  return {
    total: total || 0,
    unread: unread || 0,
    flagged: flagged || 0,
    today: today || 0,
    thisWeek: thisWeek || 0,
  };
}

/**
 * Block an IP address for recipient
 * @param recipientId - UUID of recipient
 * @param ipHash - SHA-256 hash of IP address to block
 * @param reason - Optional reason for blocking
 * @returns true if successful
 */
export async function blockIpAddress(
  recipientId: string,
  ipHash: string,
  reason?: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('blocked_senders')
    .insert({
      user_id: recipientId,
      blocked_ip_hash: ipHash,
      reason: reason || null,
    });

  if (error) {
    console.error('Error blocking IP address:', error);
    return false;
  }

  return true;
}

/**
 * Unblock an IP address for recipient
 * @param recipientId - UUID of recipient
 * @param ipHash - SHA-256 hash of IP address to unblock
 * @returns true if successful
 */
export async function unblockIpAddress(
  recipientId: string,
  ipHash: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('blocked_senders')
    .delete()
    .eq('user_id', recipientId)
    .eq('blocked_ip_hash', ipHash);

  if (error) {
    console.error('Error unblocking IP address:', error);
    return false;
  }

  return true;
}
