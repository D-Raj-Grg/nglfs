import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageForm } from "@/components/profile/message-form";
import { ShareProfile } from "@/components/profile/share-profile";
import { User } from "lucide-react";
import { ClientTracker } from "@/components/tracking/client-tracker";

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

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#FF006E] via-[#FF4B7A] to-[#FF8C42] overflow-hidden">
      {/* Enhanced Tracking - Invisible component that tracks visits */}
      <ClientTracker profileId={profile.id} />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-700 to-gray-900">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.display_name || profile.username}
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-black truncate">
                @{profile.username}
              </h1>
              <p className="text-gray-600 text-sm">
                send me anonymous messages!
              </p>
            </div>
          </div>
        </div>

        {/* Message Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-black">
                send an anonymous message
              </h2>
              <p className="text-gray-600 text-sm">
                say something nice... or not. they&apos;ll never know it&apos;s you!
              </p>
            </div>

            <MessageForm recipientUsername={profile.username} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <Link
            href="/"
            className="block w-full bg-secondary text-white text-xl font-bold py-2 rounded-full hover:bg-gray-900 transition-colors"
          >
            get your own messages!
          </Link>

          <div className="flex justify-center gap-3 text-sm text-white/90">
            <Link href="/terms" className="hover:text-white">
              terms
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-white">
              privacy
            </Link>
          </div>
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
