"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Check, X, Save, MessageSquare, Eye, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MagicCard } from "@/components/ui/magic-card";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordChangeForm } from "@/components/settings/password-change-form";
import { AccountDeletion } from "@/components/settings/account-deletion";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { PrivacySettings } from "@/components/settings/privacy-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { useProfileStore } from "@/lib/stores/profile-store";
import { validateUsername, sanitizeUsername } from "@/lib/validations/username";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";

/**
 * Profile update validation schema
 */
const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
  display_name: z
    .string()
    .max(50, "Display name must be at most 50 characters")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(150, "Bio must be at most 150 characters")
    .optional()
    .or(z.literal("")),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

type UsernameAvailability = {
  status: "idle" | "checking" | "available" | "taken" | "invalid" | "unchanged";
  message?: string;
};

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, updateProfile } = useProfileStore();

  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalUsername, setOriginalUsername] = useState("");
  const [usernameAvailability, setUsernameAvailability] =
    useState<UsernameAvailability>({ status: "idle" });
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    mode: "onChange",
  });

  const username = watch("username");

  // Load profile data on mount
  useEffect(() => {
    if (profile) {
      setValue("username", profile.username);
      setValue("display_name", profile.display_name || "");
      setValue("bio", profile.bio || "");
      setAvatarUrl(profile.avatar_url || "");
      setOriginalUsername(profile.username);
    }
  }, [profile, setValue]);

  // Check username availability with debounce
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailability({ status: "idle" });
      return;
    }

    // If username hasn't changed, mark as unchanged
    if (username.toLowerCase() === originalUsername.toLowerCase()) {
      setUsernameAvailability({
        status: "unchanged",
        message: "Current username",
      });
      return;
    }

    // Clear previous timeout
    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }

    // Validate format first
    const validation = validateUsername(username);
    if (!validation.isValid) {
      setUsernameAvailability({
        status: "invalid",
        message: validation.error,
      });
      return;
    }

    // Debounce API call
    const timeout = setTimeout(async () => {
      setUsernameAvailability({ status: "checking" });

      try {
        const response = await fetch("/api/profile/check-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.toLowerCase() }),
        });

        const data = await response.json();

        if (data.available) {
          setUsernameAvailability({
            status: "available",
            message: "Username is available!",
          });
        } else {
          setUsernameAvailability({
            status: "taken",
            message: data.error || "Username is taken",
          });
        }
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameAvailability({
          status: "invalid",
          message: "Failed to check availability",
        });
      }
    }, 500);

    setCheckTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [username, originalUsername]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: ProfileUpdateData) => {
    // Username availability check
    if (
      username !== originalUsername &&
      usernameAvailability.status !== "available"
    ) {
      toast.error("Please choose an available username");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username.toLowerCase(),
          display_name: data.display_name || data.username,
          bio: data.bio || null,
          avatar_url: avatarUrl || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to update profile");
        return;
      }

      // Update Zustand store
      updateProfile(result.profile);

      toast.success("Profile updated successfully!");

      // Update original username if changed
      if (data.username !== originalUsername) {
        setOriginalUsername(data.username);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <AnimatedGradientText className="text-3xl font-bold mb-2">
          Profile Settings
        </AnimatedGradientText>
        <p className="text-gray-400">
          Update your profile information and customize your anonymous messaging page
        </p>
      </div>

      {/* Profile Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MagicCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-500/10">
              <MessageSquare className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{profile.message_count || 0}</p>
              <p className="text-sm text-gray-400">Total Messages</p>
            </div>
          </div>
        </MagicCard>

        <MagicCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-pink-500/10">
              <Eye className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{profile.total_visits || 0}</p>
              <p className="text-sm text-gray-400">Profile Views</p>
            </div>
          </div>
        </MagicCard>

        <MagicCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {profile.created_at
                  ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
                  : 0}
              </p>
              <p className="text-sm text-gray-400">Days Active</p>
            </div>
          </div>
        </MagicCard>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        {/* Responsive tabs: 2 columns on mobile, 3 on tablet, all in one row on desktop */}
        <TabsList className="w-full h-auto p-1 gap-1 bg-gray-800/50 backdrop-blur-sm grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-6">
          <TabsTrigger
            value="profile"
            className="px-4 py-2.5 text-sm data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="px-4 py-2.5 text-sm data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="px-4 py-2.5 text-sm data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="px-4 py-2.5 text-sm data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            Privacy
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="px-4 py-2.5 text-sm data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            Security
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="px-4 py-2.5 text-sm data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            Account
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <MagicCard className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex justify-center">
            <AvatarUpload
              currentAvatarUrl={avatarUrl}
              onUploadComplete={async (url) => {
                setAvatarUrl(url);
                // Immediately save to database and update Zustand store
                try {
                  const response = await fetch("/api/profile/update", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ avatar_url: url }),
                  });

                  if (response.ok) {
                    const result = await response.json();
                    // Update Zustand store with full profile from server
                    updateProfile(result.profile);
                  }
                } catch (error) {
                  console.error("Error updating avatar:", error);
                }
              }}
            />
          </div>

          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">
              Username *
            </Label>
            <div className="relative">
              <Input
                id="username"
                {...register("username")}
                className="pr-10"
                onChange={(e) => {
                  const sanitized = sanitizeUsername(e.target.value);
                  e.target.value = sanitized;
                  register("username").onChange(e);
                }}
              />
              {/* Availability indicator */}
              {usernameAvailability.status === "checking" && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
              )}
              {(usernameAvailability.status === "available" ||
                usernameAvailability.status === "unchanged") && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
              {usernameAvailability.status === "taken" && (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              )}
            </div>

            {/* Validation message */}
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
            {usernameAvailability.message && (
              <p
                className={cn(
                  "text-sm",
                  usernameAvailability.status === "available" ||
                    usernameAvailability.status === "unchanged"
                    ? "text-green-500"
                    : "text-red-500"
                )}
              >
                {usernameAvailability.message}
              </p>
            )}
          </div>

          {/* Display Name Field */}
          <div className="space-y-2">
            <Label htmlFor="display_name" className="text-white">
              Display Name (Optional)
            </Label>
            <Input
              id="display_name"
              {...register("display_name")}
              placeholder="Your Name"
            />
            {errors.display_name && (
              <p className="text-sm text-red-500">
                {errors.display_name.message}
              </p>
            )}
          </div>

          {/* Bio Field */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-white">
              Bio (Optional)
            </Label>
            <Textarea
              id="bio"
              {...register("bio")}
              placeholder="Tell others about yourself..."
              className="resize-none h-24"
              maxLength={150}
            />
            <p className="text-sm text-gray-500 text-right">
              {watch("bio")?.length || 0}/150
            </p>
            {errors.bio && (
              <p className="text-sm text-red-500">{errors.bio.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !isDirty ||
                (username !== originalUsername &&
                  usernameAvailability.status !== "available")
              }
              className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
            </form>
          </MagicCard>

          {/* Profile URL Preview */}
          <MagicCard className="p-6 mt-6">
        <div className="space-y-2">
          <Label className="text-white">Your Profile URL</Label>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/${profile.username}`}
              className="flex-1 bg-gray-800/50"
            />
            <Button
              variant="outline"
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/${profile.username}`
                  );
                  toast.success("Profile URL copied!");
                }
              }}
            >
              Copy
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Share this link to receive anonymous messages
          </p>
            </div>
          </MagicCard>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <MagicCard className="p-8">
            <ThemeToggle />
          </MagicCard>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <MagicCard className="p-8">
            <NotificationSettings />
          </MagicCard>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <MagicCard className="p-8">
            <PrivacySettings />
          </MagicCard>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <MagicCard className="p-8">
            <PasswordChangeForm />
          </MagicCard>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <MagicCard className="p-8 mb-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Account Information</h3>
                <p className="text-gray-400 mb-4">
                  Manage your account settings and preferences
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-800">
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Change Email (Coming Soon)
                  </Button>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-800">
                  <div>
                    <p className="text-white font-medium">Account Created</p>
                    <p className="text-sm text-gray-400">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-800">
                  <div>
                    <p className="text-white font-medium">User ID</p>
                    <p className="text-sm text-gray-400 font-mono">{user?.id?.slice(0, 8)}...</p>
                  </div>
                </div>
              </div>
            </div>
          </MagicCard>

          {/* Account Deletion */}
          <AccountDeletion />
        </TabsContent>
      </Tabs>
    </div>
  );
}
