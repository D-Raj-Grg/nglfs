import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getHashedIP } from '@/lib/utils/ip-hash';
import { getParsedUserAgent } from '@/lib/utils/user-agent-parser';
import { getClassifiedReferrer, isInAppBrowser } from '@/lib/utils/referrer-classifier';
import { extractUTMParams, sanitizeUTMParams } from '@/lib/utils/utm-params';

/**
 * Visit tracking validation schema
 */
const visitTrackingSchema = z.object({
  profileId: z.string().uuid(),
  clientData: z
    .object({
      timezone: z.string(),
      language: z.string(),
      screenResolution: z.string(),
      colorDepth: z.number(),
      touchSupport: z.boolean(),
      viewportSize: z.string(),
      connectionType: z.string().nullable(),
      pixelRatio: z.number(),
      availableScreen: z.string(),
    })
    .optional(),
  timestamp: z.string().optional(),
});

/**
 * POST /api/analytics/track-visit
 * Track a profile page visit with enhanced device and referrer analytics
 *
 * Request body:
 * {
 *   "profileId": "uuid",
 *   "clientData": {
 *     "timezone": "America/New_York",
 *     "language": "en-US",
 *     "screenResolution": "1920x1080",
 *     ... other client-side data
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Create anonymous Supabase client
    const { createServerClient } = await import('@supabase/ssr');
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {
            // No-op for anonymous requests
          },
        },
      }
    );

    // Parse and validate request body
    const body = await request.json();
    const validationResult = visitTrackingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid tracking data',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { profileId, clientData } = validationResult.data;

    // Collect server-side tracking data
    const ipHash = getHashedIP(request.headers);
    const userAgent = getParsedUserAgent(request.headers);
    const referrer = getClassifiedReferrer(request.headers);
    const utmParams = sanitizeUTMParams(extractUTMParams(request.nextUrl.searchParams));
    const inAppBrowser = isInAppBrowser(referrer, userAgent.raw);

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', profileId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Insert visit record with de-duplication (unique constraint on profile_id, visitor_ip_hash, hour)
    const { error: insertError } = await supabase.from('link_visits').insert({
      profile_id: profileId,
      visitor_ip_hash: ipHash,
      referrer: referrer.raw,
      user_agent: userAgent.raw,
      // Device information
      device_type: userAgent.device.type,
      browser_name: userAgent.browser.name,
      browser_version: userAgent.browser.version,
      os_name: userAgent.os.name,
      os_version: userAgent.os.version,
      // Client-side data
      screen_resolution: clientData?.screenResolution || null,
      timezone: clientData?.timezone || null,
      language: clientData?.language || null,
      viewport_size: clientData?.viewportSize || null,
      pixel_ratio: clientData?.pixelRatio || null,
      connection_type: clientData?.connectionType || null,
      touch_support: clientData?.touchSupport || null,
      // Referrer classification
      referrer_platform: referrer.platform,
      referrer_category: referrer.category,
      referrer_domain: referrer.domain,
      is_social_referrer: referrer.isSocial,
      is_in_app_browser: inAppBrowser,
      // UTM parameters
      utm_source: utmParams.source,
      utm_medium: utmParams.medium,
      utm_campaign: utmParams.campaign,
      utm_term: utmParams.term,
      utm_content: utmParams.content,
    });

    // Ignore duplicate constraint violations (same IP visiting within the same hour)
    if (insertError && insertError.code !== '23505') {
      console.error('Error tracking visit:', insertError);
      return NextResponse.json({ error: 'Failed to track visit' }, { status: 500 });
    }

    // Track analytics event
    await supabase.from('message_analytics').insert({
      user_id: profileId,
      event_type: 'profile_viewed',
      metadata: {
        referrer_platform: referrer.platform,
        device_type: userAgent.device.type,
        utm_source: utmParams.source,
        in_app_browser: inAppBrowser,
      },
    });

    return NextResponse.json(
      {
        success: true,
        tracked: {
          device: userAgent.device.type,
          platform: referrer.platform,
          utm: utmParams.hasUTM,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in track visit API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/analytics/track-visit
 * Returns tracking configuration for debugging
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/analytics/track-visit',
    method: 'POST',
    description: 'Track profile page visits with enhanced analytics',
    fields: [
      'device_type',
      'browser',
      'os',
      'referrer_platform',
      'utm_source',
      'timezone',
      'language',
      'screen_resolution',
    ],
  });
}
