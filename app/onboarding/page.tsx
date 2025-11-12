"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MagicCard } from "@/components/ui/magic-card";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { createProfile, useProfileStore } from "@/lib/stores/profile-store";
import { validateUsername, sanitizeUsername } from "@/lib/validations/username";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { NotificationPrompt, useNotificationPrompt } from "@/components/notifications/notification-prompt";

/**
 * Profile form validation schema
 */
const profileFormSchema = z.object({
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

type ProfileFormData = z.infer<typeof profileFormSchema>;

/**
 * Username availability state
 */
type UsernameAvailability = {
  status: "idle" | "checking" | "available" | "taken" | "invalid";
  message?: string;
  suggestions?: string[];
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasProfile } = useProfileStore();
  const { isOpen, show, hide } = useNotificationPrompt();

  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameAvailability, setUsernameAvailability] =
    useState<UsernameAvailability>({ status: "idle" });
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
  });

  const username = watch("username");

  // Redirect if user already has a profile
  useEffect(() => {
    if (hasProfile()) {
      router.push("/dashboard");
    }
  }, [hasProfile, router]);

  // Check username availability with debounce
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailability({ status: "idle" });
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
            suggestions: data.suggestions,
          });
        }
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameAvailability({
          status: "invalid",
          message: "Failed to check availability",
        });
      }
    }, 500); // 500ms debounce

    setCheckTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [username]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: ProfileFormData) => {
    // Final username availability check
    if (usernameAvailability.status !== "available") {
      toast.error("Please choose an available username");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createProfile({
        username: data.username.toLowerCase(),
        display_name: data.display_name || data.username,
        bio: data.bio || undefined,
        avatar_url: avatarUrl || undefined,
      });

      if (result.success) {
        toast.success("Profile created successfully!");

        // Show notification prompt after successful profile creation
        // Use setTimeout to ensure it appears after the success toast
        setTimeout(() => {
          show();
        }, 1000);
      } else {
        toast.error(result.error || "Failed to create profile");
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Apply suggested username
   */
  const applySuggestion = (suggestion: string) => {
    // This is a workaround since we can't directly set react-hook-form values without setValue
    const input = document.querySelector('input[name="username"]') as HTMLInputElement;
    if (input) {
      input.value = suggestion;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-gray-950 via-gray-900 to-black">
      <BlurFade delay={0.1} inView>
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <AnimatedGradientText className="text-4xl font-bold mb-4">
              Create Your Profile
            </AnimatedGradientText>
          <p className="text-gray-400">
            Set up your anonymous messaging profile in just a few steps
          </p>
        </div>

        {/* Form Card */}
        <MagicCard className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex justify-center">
              <AvatarUpload
                currentAvatarUrl={avatarUrl}
                onUploadComplete={(url) => setAvatarUrl(url)}
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
                  placeholder="cooluser123"
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
                {usernameAvailability.status === "available" && (
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
                    usernameAvailability.status === "available"
                      ? "text-green-500"
                      : "text-red-500"
                  )}
                >
                  {usernameAvailability.message}
                </p>
              )}

              {/* Username suggestions */}
              {usernameAvailability.suggestions &&
                usernameAvailability.suggestions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-400 mb-2">
                      Try these instead:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {usernameAvailability.suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => applySuggestion(suggestion)}
                          className="px-3 py-1 text-sm bg-purple-500/10 text-purple-400 rounded-full hover:bg-purple-500/20 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
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

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                usernameAvailability.status !== "available"
              }
              className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Profile
                </>
              )}
            </Button>
          </form>
        </MagicCard>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Your username will be part of your public profile URL
        </p>
        </div>
      </BlurFade>

      {/* Notification Permission Prompt */}
      <NotificationPrompt
        isOpen={isOpen}
        onClose={() => {
          hide();
          // Navigate to dashboard whether they enable or skip
          router.push("/dashboard");
        }}
        onSuccess={() => {
          // Navigate to dashboard after enabling notifications
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
