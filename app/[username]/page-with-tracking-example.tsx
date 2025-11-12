/**
 * EXAMPLE: Profile Page with Enhanced Tracking
 *
 * This is an example implementation showing how to integrate the
 * enhanced tracking system into a user profile page.
 *
 * To use this in your actual [username]/page.tsx:
 * 1. Import the ClientTracker component
 * 2. Add it to your page component
 * 3. Pass the profile ID
 *
 * The ClientTracker component will automatically:
 * - Collect client-side data (timezone, language, screen resolution, etc.)
 * - Send it to /api/analytics/track-visit
 * - Track referrer, device, and UTM parameters
 */

import { ClientTracker } from '@/components/tracking/client-tracker';

interface ProfilePageProps {
  params: {
    username: string;
  };
  searchParams: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  // Fetch profile data (example)
  // const profile = await getProfileByUsername(params.username);

  // For this example, we'll use a placeholder
  const profile = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: params.username,
    displayName: 'John Doe',
    bio: 'Send me anonymous messages!',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] p-4">
      {/* IMPORTANT: Add ClientTracker component - it's invisible and tracks visits */}
      <ClientTracker profileId={profile.id} debug={false} />

      {/* Profile content */}
      <div className="max-w-2xl mx-auto pt-12">
        <div className="bg-[#1A1A1A]/80 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <h1 className="text-4xl font-bold text-white mb-2">{profile.displayName}</h1>
          <p className="text-gray-400 mb-1">@{profile.username}</p>
          <p className="text-gray-300 mb-8">{profile.bio}</p>

          {/* Message form */}
          <form className="space-y-4">
            <textarea
              className="w-full bg-[#0A0A0A] text-white rounded-xl p-4 border border-white/10 focus:border-purple-500 focus:outline-none min-h-[150px] resize-none"
              placeholder="Send an anonymous message..."
              maxLength={500}
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity"
            >
              Send Anonymous Message
            </button>
          </form>

          {/* UTM tracking indicator (optional - for debugging) */}
          {searchParams.utm_source && (
            <div className="mt-4 text-xs text-gray-500 text-center">
              Tracked from: {searchParams.utm_source}
              {searchParams.utm_medium && ` / ${searchParams.utm_medium}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * USAGE NOTES:
 *
 * 1. The ClientTracker component is invisible and runs once per page visit
 * 2. It collects: timezone, language, screen resolution, touch support, etc.
 * 3. Server-side, we also track: IP (hashed), User-Agent, Referrer, UTM params
 * 4. All tracking respects privacy (IPs are hashed with daily salt + truncation)
 *
 * 5. To generate UTM tracking links for social media:
 *
 * import { generateSocialUTMUrl } from '@/lib/utils/utm-params';
 *
 * const instagramLink = generateSocialUTMUrl(
 *   'https://nglfs.com/john',
 *   'instagram',
 *   'story',
 *   'summer_promo'
 * );
 * // Returns: https://nglfs.com/john?utm_source=instagram&utm_medium=story&utm_campaign=summer_promo
 *
 * 6. Analytics data can be queried from these tables:
 *    - link_visits: Individual visits with full tracking data
 *    - analytics_traffic_sources: Pre-aggregated referrer stats
 *    - analytics_device_breakdown: Device type distribution
 *    - analytics_utm_campaigns: UTM campaign performance
 */
