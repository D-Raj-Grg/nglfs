"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useProfileStore, fetchProfile } from "@/lib/stores/profile-store";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { profile, hasProfile, isLoading: profileLoading } = useProfileStore();

  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      // Wait for auth to load
      if (authLoading) return;

      // If no user, middleware will redirect to login
      if (!user) return;

      // Check if we have profile in store
      if (!hasProfile()) {
        // Try to fetch profile from API
        const fetchedProfile = await fetchProfile(user.id);

        // If still no profile, redirect to onboarding
        if (!fetchedProfile) {
          router.push("/onboarding");
          return;
        }
      }

      // User has profile, they can stay on dashboard
    };

    checkProfileAndRedirect();
  }, [user, authLoading, hasProfile, router]);

  // Show loading state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-500" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show dashboard content only if user has profile
  if (!hasProfile()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-500" />
          <p className="text-muted-foreground">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <AnimatedGradientText className="text-4xl font-bold">
          Welcome back, {profile?.display_name || profile?.username}!
        </AnimatedGradientText>
        <p className="text-muted-foreground">
          Manage your anonymous messages and profile settings
        </p>
      </div>

      {/* Dashboard Content - Placeholder */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Stats Card 1 */}
        <div className="rounded-2xl border bg-card p-6 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Messages
          </h3>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-muted-foreground">
            No messages yet
          </p>
        </div>

        {/* Stats Card 2 */}
        <div className="rounded-2xl border bg-card p-6 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Unread Messages
          </h3>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-muted-foreground">
            All caught up!
          </p>
        </div>

        {/* Stats Card 3 */}
        <div className="rounded-2xl border bg-card p-6 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Profile Views
          </h3>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-muted-foreground">
            Start sharing your link
          </p>
        </div>
      </div>

      {/* Share Link Card */}
      <div className="rounded-2xl border bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 space-y-4">
        <h3 className="text-xl font-semibold">Your Anonymous Message Link</h3>
        <p className="text-muted-foreground">
          Share this link to receive anonymous messages
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-background/50 px-4 py-2 text-sm">
            {typeof window !== "undefined"
              ? `${window.location.origin}/${profile?.username}`
              : `/${profile?.username}`}
          </code>
          <button
            onClick={() => {
              if (profile?.username) {
                navigator.clipboard.writeText(
                  `${window.location.origin}/${profile.username}`
                );
                // TODO: Add toast notification
              }
            }}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="rounded-2xl border border-dashed border-muted-foreground/30 p-8 text-center space-y-2">
        <p className="text-muted-foreground">
          Dashboard features coming soon: message inbox, analytics, and more!
        </p>
      </div>
    </div>
  );
}
