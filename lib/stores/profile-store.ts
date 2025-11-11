import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

/**
 * Profile interface matching database schema
 */
export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  message_count?: number;
  total_visits?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Profile store state interface
 */
interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProfile: (profile: Profile | null) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  clearProfile: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed values
  hasProfile: () => boolean;
  getDisplayName: () => string;
  getAvatarUrl: () => string | null;
}

/**
 * Profile Zustand store with persistence
 * Manages user profile state across the application
 */
export const useProfileStore = create<ProfileState>()(
  devtools(
    persist(
      (set, get) => ({
        profile: null,
        isLoading: false,
        error: null,

        // Set complete profile
        setProfile: (profile) => {
          set({ profile, error: null });
        },

        // Update specific profile fields
        updateProfile: (updates) => {
          set((state) => ({
            profile: state.profile
              ? { ...state.profile, ...updates }
              : null,
          }));
        },

        // Clear profile (on logout)
        clearProfile: () => {
          set({ profile: null, error: null });
        },

        // Set loading state
        setLoading: (isLoading) => {
          set({ isLoading });
        },

        // Set error message
        setError: (error) => {
          set({ error });
        },

        // Check if user has a profile
        hasProfile: () => {
          return get().profile !== null;
        },

        // Get display name (fallback to username)
        getDisplayName: () => {
          const { profile } = get();
          if (!profile) return "User";
          return profile.display_name || profile.username;
        },

        // Get avatar URL
        getAvatarUrl: () => {
          const { profile } = get();
          return profile?.avatar_url || null;
        },
      }),
      {
        name: "profile-storage", // localStorage key
        partialize: (state) => ({
          profile: state.profile,
        }),
      }
    ),
    {
      name: "ProfileStore",
    }
  )
);

/**
 * Fetch user profile from API and update store
 */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { setLoading, setProfile, setError } = useProfileStore.getState();

  setLoading(true);
  setError(null);

  try {
    const response = await fetch(`/api/profile/${userId}`);

    if (!response.ok) {
      if (response.status === 404) {
        setProfile(null);
        return null;
      }
      throw new Error("Failed to fetch profile");
    }

    const data = await response.json();
    setProfile(data.profile);
    return data.profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    setError("Failed to load profile");
    return null;
  } finally {
    setLoading(false);
  }
}

/**
 * Create new profile and update store
 */
export async function createProfile(profileData: {
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { setLoading, setProfile, setError } = useProfileStore.getState();

  setLoading(true);
  setError(null);

  try {
    const response = await fetch("/api/profile/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Failed to create profile");
      return { success: false, error: data.error };
    }

    setProfile(data.profile);
    return { success: true };
  } catch (error) {
    console.error("Error creating profile:", error);
    const errorMessage = "Failed to create profile";
    setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setLoading(false);
  }
}

/**
 * Upload avatar and return URL
 */
export async function uploadAvatar(file: File): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  const { setLoading, setError } = useProfileStore.getState();

  setLoading(true);
  setError(null);

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/profile/upload-avatar", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Failed to upload avatar");
      return { success: false, error: data.error };
    }

    return { success: true, url: data.url };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    const errorMessage = "Failed to upload avatar";
    setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setLoading(false);
  }
}
