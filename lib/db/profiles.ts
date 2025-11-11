/**
 * Profile Database Utilities
 * Server-side functions for profile CRUD operations
 * Use with Supabase server client in Server Components/Actions
 */

import { createClient } from '@/lib/supabase/server';
import type {
  Profile,
  ProfileInsert,
  ProfileUpdate,
  ProfileWithStats,
} from '@/lib/types/database.types';

/**
 * Get profile by username (public profile lookup)
 * @param username - Unique username to search for
 * @returns Profile data or null if not found
 */
export async function getProfileByUsername(
  username: string
): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching profile by username:', error);
    return null;
  }

  return data;
}

/**
 * Get profile by user ID
 * @param userId - UUID of the user
 * @returns Profile data or null if not found
 */
export async function getProfileById(
  userId: string
): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile by ID:', error);
    return null;
  }

  return data;
}

/**
 * Get current authenticated user's profile
 * @returns Current user's profile or null if not authenticated
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return getProfileById(user.id);
}

/**
 * Get profile with statistics (message count, unread count)
 * @param userId - UUID of the user
 * @returns Profile with stats or null if not found
 */
export async function getProfileWithStats(
  userId: string
): Promise<ProfileWithStats | null> {
  const supabase = await createClient();

  // Get profile
  const profile = await getProfileById(userId);
  if (!profile) {
    return null;
  }

  // Get unread message count
  const { count: unreadCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('is_read', false);

  return {
    ...profile,
    unread_count: unreadCount || 0,
  };
}

/**
 * Create a new profile (called after user signup)
 * @param profileData - Profile data to insert
 * @returns Newly created profile or null if error
 */
export async function createProfile(
  profileData: ProfileInsert
): Promise<Profile | null> {
  const supabase = await createClient();

  // Normalize username to lowercase
  const normalizedData = {
    ...profileData,
    username: profileData.username.toLowerCase(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .insert(normalizedData)
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  return data;
}

/**
 * Update profile data
 * @param userId - UUID of the user
 * @param updates - Partial profile data to update
 * @returns Updated profile or null if error
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<Profile | null> {
  const supabase = await createClient();

  // Don't allow username changes via this function (security)
  const { username, ...safeUpdates } = updates;

  const { data, error } = await supabase
    .from('profiles')
    .update(safeUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data;
}

/**
 * Check if username is available
 * @param username - Username to check
 * @returns true if available, false if taken
 */
export async function isUsernameAvailable(
  username: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username.toLowerCase())
    .maybeSingle();

  return data === null;
}

/**
 * Deactivate profile (soft delete)
 * @param userId - UUID of the user
 * @returns true if successful, false otherwise
 */
export async function deactivateProfile(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', userId);

  if (error) {
    console.error('Error deactivating profile:', error);
    return false;
  }

  return true;
}

/**
 * Increment profile visit count
 * @param profileId - UUID of the profile
 * @returns true if successful, false otherwise
 */
export async function incrementProfileVisits(
  profileId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('increment', {
    table_name: 'profiles',
    row_id: profileId,
    column_name: 'total_visits',
  });

  // If RPC doesn't exist, fallback to manual increment
  if (error) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ total_visits: supabase.raw('total_visits + 1') })
      .eq('id', profileId);

    if (updateError) {
      console.error('Error incrementing profile visits:', updateError);
      return false;
    }
  }

  return true;
}

/**
 * Search profiles by username (partial match)
 * @param searchTerm - Search string
 * @param limit - Maximum number of results (default 10)
 * @returns Array of matching profiles
 */
export async function searchProfiles(
  searchTerm: string,
  limit: number = 10
): Promise<Profile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_active', true)
    .ilike('username', `%${searchTerm.toLowerCase()}%`)
    .order('message_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error searching profiles:', error);
    return [];
  }

  return data || [];
}

/**
 * Get top profiles by message count (leaderboard)
 * @param limit - Number of profiles to return (default 10)
 * @returns Array of top profiles
 */
export async function getTopProfiles(limit: number = 10): Promise<Profile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_active', true)
    .order('message_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top profiles:', error);
    return [];
  }

  return data || [];
}
