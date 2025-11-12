import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageForm } from "@/components/profile/message-form";
import { ShareProfile } from "@/components/profile/share-profile";
import { Particles } from "@/components/ui/particles";
import { MagicCard } from "@/components/ui/magic-card";
import { User } from "lucide-react";

interface PublicProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

/**
 * Public Profile Page - Dynamic route for viewing user profiles
 * Accessible without authentication
 * URL: /[username]
 */
export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { username } = await params;

  // Fetch profile by username
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .single();

  // Show 404 if profile doesn't exist
  if (error || !profile) {
    notFound();
  }

  // Track profile visit (we'll implement this later with IP hashing)
  // For now, just log the visit
  // TODO: Implement visit tracking with IP hashing

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-gray-950 via-gray-900 to-black overflow-hidden">
      {/* Animated Background */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={100}
        ease={80}
        color="#8B5CF6"
        refresh={false}
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Profile Card */}
        <MagicCard className="p-8 mb-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Avatar */}
            <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-purple-500/20 ring-offset-4 ring-offset-gray-900">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <User className="w-14 h-14 text-white" />
                </div>
              )}
            </div>

            {/* Display Name */}
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-gray-400 text-sm mt-1">@{profile.username}</p>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-300 max-w-md">{profile.bio}</p>
            )}

            {/* Share Button */}
            <ShareProfile username={profile.username} />
          </div>
        </MagicCard>

        {/* Message Form Card */}
        <MagicCard className="p-8">
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">
                Send an Anonymous Message
              </h2>
              <p className="text-gray-400 text-sm">
                Say something nice... or not. They&apos;ll never know it&apos;s you!
              </p>
            </div>

            <MessageForm recipientUsername={profile.username} />
          </div>
        </MagicCard>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Want your own anonymous messaging link?{" "}
            <Link
              href="/"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Create your profile
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .single();

  if (!profile) {
    return {
      title: "Profile Not Found",
    };
  }

  return {
    title: `${profile.display_name || profile.username} - Send Anonymous Message`,
    description: profile.bio || `Send an anonymous message to ${profile.display_name || profile.username}`,
    openGraph: {
      title: `Send ${profile.display_name || profile.username} an anonymous message`,
      description: profile.bio || "Say something anonymously!",
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}
