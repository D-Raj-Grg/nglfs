/**
 * Referrer Classification Utilities
 *
 * Classifies traffic sources from HTTP Referer headers to identify
 * which social media platforms, search engines, or websites are
 * driving traffic to user profiles.
 */

export interface ReferrerInfo {
  /** Original referrer URL */
  raw: string | null;
  /** Classified platform name (e.g., 'instagram', 'tiktok', 'google') */
  platform: string;
  /** Traffic category (social, search, referral, direct) */
  category: 'social' | 'search' | 'referral' | 'direct';
  /** Display-friendly name */
  displayName: string;
  /** Is this a social media platform? */
  isSocial: boolean;
  /** Full domain (e.g., 'instagram.com') */
  domain: string | null;
}

/**
 * Social media platform mapping
 * Key: domain pattern to match
 * Value: platform identifier
 */
const SOCIAL_PLATFORMS: Record<string, string> = {
  'instagram.com': 'instagram',
  'l.instagram.com': 'instagram', // Instagram in-app browser redirect
  'tiktok.com': 'tiktok',
  'snapchat.com': 'snapchat',
  't.co': 'twitter', // Twitter URL shortener
  'twitter.com': 'twitter',
  'x.com': 'twitter', // Twitter rebrand
  'facebook.com': 'facebook',
  'fb.com': 'facebook',
  'linkedin.com': 'linkedin',
  'reddit.com': 'reddit',
  'youtube.com': 'youtube',
  'pinterest.com': 'pinterest',
  'tumblr.com': 'tumblr',
  'whatsapp.com': 'whatsapp',
  'telegram.org': 'telegram',
  'discord.com': 'discord',
  'threads.net': 'threads',
  'bsky.app': 'bluesky',
};

/**
 * Search engine mapping
 */
const SEARCH_ENGINES: Record<string, string> = {
  'google': 'google',
  'bing': 'bing',
  'yahoo': 'yahoo',
  'duckduckgo': 'duckduckgo',
  'baidu': 'baidu',
  'yandex': 'yandex',
};

/**
 * Display names for platforms
 */
const DISPLAY_NAMES: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  snapchat: 'Snapchat',
  twitter: 'X (Twitter)',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  reddit: 'Reddit',
  youtube: 'YouTube',
  pinterest: 'Pinterest',
  tumblr: 'Tumblr',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  discord: 'Discord',
  threads: 'Threads',
  bluesky: 'Bluesky',
  google: 'Google Search',
  bing: 'Bing Search',
  yahoo: 'Yahoo Search',
  duckduckgo: 'DuckDuckGo',
  baidu: 'Baidu',
  yandex: 'Yandex',
  direct: 'Direct Traffic',
  other: 'Other',
};

/**
 * Classifies a referrer URL into platform and category
 *
 * @param referrerURL - HTTP Referer header value
 * @returns Classified referrer information
 */
export function classifyReferrer(referrerURL: string | null): ReferrerInfo {
  // Direct traffic (no referrer)
  if (!referrerURL || referrerURL.trim() === '') {
    return {
      raw: null,
      platform: 'direct',
      category: 'direct',
      displayName: DISPLAY_NAMES.direct,
      isSocial: false,
      domain: null,
    };
  }

  try {
    const url = new URL(referrerURL);
    const domain = url.hostname.toLowerCase();

    // Check social media platforms
    for (const [urlPattern, platform] of Object.entries(SOCIAL_PLATFORMS)) {
      if (domain.includes(urlPattern) || domain === urlPattern) {
        return {
          raw: referrerURL,
          platform,
          category: 'social',
          displayName: DISPLAY_NAMES[platform] || platform,
          isSocial: true,
          domain: urlPattern,
        };
      }
    }

    // Check search engines
    for (const [urlPattern, engine] of Object.entries(SEARCH_ENGINES)) {
      if (domain.includes(urlPattern)) {
        return {
          raw: referrerURL,
          platform: engine,
          category: 'search',
          displayName: DISPLAY_NAMES[engine] || engine,
          isSocial: false,
          domain,
        };
      }
    }

    // Other referral traffic
    return {
      raw: referrerURL,
      platform: 'other',
      category: 'referral',
      displayName: domain,
      isSocial: false,
      domain,
    };
  } catch (error) {
    // Invalid URL format
    return {
      raw: referrerURL,
      platform: 'other',
      category: 'referral',
      displayName: 'Unknown',
      isSocial: false,
      domain: null,
    };
  }
}

/**
 * Extracts referrer from Next.js request headers
 *
 * @param headers - Next.js request headers
 * @returns Referrer URL or null
 */
export function getReferrer(headers: Headers): string | null {
  return headers.get('referer') || headers.get('referrer') || null;
}

/**
 * Complete classification flow: Extract referrer from headers and classify it
 *
 * @param headers - Next.js request headers
 * @returns Classified referrer information
 */
export function getClassifiedReferrer(headers: Headers): ReferrerInfo {
  const referrerURL = getReferrer(headers);
  return classifyReferrer(referrerURL);
}

/**
 * Gets a list of top social media platforms (for filtering/grouping)
 *
 * @returns Array of social platform identifiers
 */
export function getTopSocialPlatforms(): string[] {
  return [
    'instagram',
    'tiktok',
    'snapchat',
    'twitter',
    'facebook',
    'youtube',
    'reddit',
    'linkedin',
  ];
}

/**
 * Checks if a referrer is from a social media platform
 *
 * @param referrerInfo - Classified referrer or platform string
 * @returns True if social media
 */
export function isSocialReferrer(referrerInfo: ReferrerInfo | string): boolean {
  if (typeof referrerInfo === 'string') {
    return Object.values(SOCIAL_PLATFORMS).includes(referrerInfo.toLowerCase());
  }
  return referrerInfo.isSocial;
}

/**
 * Groups referrers into simplified categories for analytics
 *
 * @param referrerInfo - Classified referrer
 * @returns Simplified category
 */
export function getSimplifiedCategory(referrerInfo: ReferrerInfo): string {
  switch (referrerInfo.category) {
    case 'social':
      // Further categorize popular platforms
      if (['instagram', 'tiktok', 'snapchat'].includes(referrerInfo.platform)) {
        return 'Visual Social Media';
      }
      if (['twitter', 'facebook', 'threads'].includes(referrerInfo.platform)) {
        return 'Text Social Media';
      }
      return 'Social Media';
    case 'search':
      return 'Search Engine';
    case 'direct':
      return 'Direct';
    default:
      return 'Other Websites';
  }
}

/**
 * Detects if referrer is from a mobile app's in-app browser
 * (Instagram, TikTok, Snapchat often use their own browsers)
 *
 * @param referrerInfo - Classified referrer
 * @param userAgent - User agent string
 * @returns True if likely from in-app browser
 */
export function isInAppBrowser(
  referrerInfo: ReferrerInfo,
  userAgent: string
): boolean {
  const ua = userAgent.toLowerCase();

  // Instagram in-app browser indicators
  if (referrerInfo.platform === 'instagram') {
    return ua.includes('instagram') || referrerInfo.domain === 'l.instagram.com';
  }

  // TikTok in-app browser
  if (referrerInfo.platform === 'tiktok') {
    return ua.includes('tiktok') || ua.includes('musical_ly');
  }

  // Snapchat in-app browser
  if (referrerInfo.platform === 'snapchat') {
    return ua.includes('snapchat');
  }

  // Facebook in-app browser
  if (referrerInfo.platform === 'facebook') {
    return ua.includes('fban') || ua.includes('fbav');
  }

  return false;
}
