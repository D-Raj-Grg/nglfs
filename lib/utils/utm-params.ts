/**
 * UTM Parameter Extraction Utilities
 *
 * Extracts and validates UTM (Urchin Tracking Module) parameters from URLs
 * for campaign tracking and traffic source attribution.
 *
 * Standard UTM Parameters:
 * - utm_source: Identifies the advertiser, site, publication (e.g., instagram, tiktok)
 * - utm_medium: Advertising medium (e.g., story, post, bio, email)
 * - utm_campaign: Campaign name (e.g., spring_promo, john_launch)
 * - utm_term: Paid search keywords (optional)
 * - utm_content: Differentiates similar content/links (optional)
 */

export interface UTMParams {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  term: string | null;
  content: string | null;
  /** True if any UTM parameters are present */
  hasUTM: boolean;
}

/**
 * Extracts UTM parameters from a URL or URLSearchParams object
 *
 * @param input - URL string, URL object, or URLSearchParams
 * @returns UTM parameters object
 */
export function extractUTMParams(
  input: string | URL | URLSearchParams
): UTMParams {
  let searchParams: URLSearchParams;

  if (typeof input === 'string') {
    try {
      const url = new URL(input);
      searchParams = url.searchParams;
    } catch {
      // If not a valid URL, treat as query string
      searchParams = new URLSearchParams(input);
    }
  } else if (input instanceof URL) {
    searchParams = input.searchParams;
  } else {
    searchParams = input;
  }

  const source = searchParams.get('utm_source');
  const medium = searchParams.get('utm_medium');
  const campaign = searchParams.get('utm_campaign');
  const term = searchParams.get('utm_term');
  const content = searchParams.get('utm_content');

  return {
    source,
    medium,
    campaign,
    term,
    content,
    hasUTM: !!(source || medium || campaign || term || content),
  };
}

/**
 * Generates a tracking URL with UTM parameters
 *
 * @param baseUrl - Base URL (e.g., https://nglfs.com/username)
 * @param params - UTM parameters to append
 * @returns URL with UTM parameters
 */
export function generateUTMUrl(
  baseUrl: string,
  params: {
    source: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  }
): string {
  const url = new URL(baseUrl);

  url.searchParams.set('utm_source', params.source);
  if (params.medium) url.searchParams.set('utm_medium', params.medium);
  if (params.campaign) url.searchParams.set('utm_campaign', params.campaign);
  if (params.term) url.searchParams.set('utm_term', params.term);
  if (params.content) url.searchParams.set('utm_content', params.content);

  return url.toString();
}

/**
 * Common UTM templates for social media platforms
 *
 * Usage:
 * ```ts
 * const url = generateSocialUTMUrl('https://nglfs.com/john', 'instagram', 'story');
 * // Returns: https://nglfs.com/john?utm_source=instagram&utm_medium=story
 * ```
 */
export function generateSocialUTMUrl(
  baseUrl: string,
  platform: 'instagram' | 'tiktok' | 'snapchat' | 'twitter' | 'facebook' | string,
  medium: 'bio' | 'story' | 'post' | 'dm' | string,
  campaign?: string
): string {
  return generateUTMUrl(baseUrl, {
    source: platform,
    medium,
    campaign,
  });
}

/**
 * Validates if UTM parameters are properly formatted
 *
 * @param params - UTM parameters to validate
 * @returns Validation result with error messages
 */
export function validateUTMParams(params: UTMParams): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check minimum required parameters
  if (params.hasUTM && !params.source) {
    errors.push('utm_source is required when using UTM tracking');
  }

  // Check parameter lengths (reasonable limits)
  const maxLength = 100;
  if (params.source && params.source.length > maxLength) {
    errors.push(`utm_source exceeds maximum length of ${maxLength}`);
  }
  if (params.medium && params.medium.length > maxLength) {
    errors.push(`utm_medium exceeds maximum length of ${maxLength}`);
  }
  if (params.campaign && params.campaign.length > maxLength) {
    errors.push(`utm_campaign exceeds maximum length of ${maxLength}`);
  }

  // Check for suspicious characters (potential XSS)
  const dangerousPattern = /[<>\"']/;
  if (params.source && dangerousPattern.test(params.source)) {
    errors.push('utm_source contains invalid characters');
  }
  if (params.medium && dangerousPattern.test(params.medium)) {
    errors.push('utm_medium contains invalid characters');
  }
  if (params.campaign && dangerousPattern.test(params.campaign)) {
    errors.push('utm_campaign contains invalid characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes UTM parameters to prevent XSS attacks
 *
 * @param params - UTM parameters to sanitize
 * @returns Sanitized parameters
 */
export function sanitizeUTMParams(params: UTMParams): UTMParams {
  const sanitize = (value: string | null): string | null => {
    if (!value) return null;
    // Remove potentially dangerous characters
    return value
      .replace(/[<>\"']/g, '')
      .trim()
      .substring(0, 100); // Max length
  };

  return {
    source: sanitize(params.source),
    medium: sanitize(params.medium),
    campaign: sanitize(params.campaign),
    term: sanitize(params.term),
    content: sanitize(params.content),
    hasUTM: params.hasUTM,
  };
}

/**
 * Formats UTM parameters for display
 *
 * @param params - UTM parameters
 * @returns Human-readable string
 */
export function formatUTMDisplay(params: UTMParams): string {
  if (!params.hasUTM) return 'No tracking parameters';

  const parts: string[] = [];

  if (params.source) parts.push(`Source: ${params.source}`);
  if (params.medium) parts.push(`Medium: ${params.medium}`);
  if (params.campaign) parts.push(`Campaign: ${params.campaign}`);
  if (params.term) parts.push(`Term: ${params.term}`);
  if (params.content) parts.push(`Content: ${params.content}`);

  return parts.join(' | ');
}

/**
 * Common platform-specific UTM presets
 *
 * These can be used to generate consistent tracking links
 */
export const UTM_PRESETS = {
  instagram: {
    bio: { source: 'instagram', medium: 'bio' },
    story: { source: 'instagram', medium: 'story' },
    post: { source: 'instagram', medium: 'post' },
    reel: { source: 'instagram', medium: 'reel' },
  },
  tiktok: {
    bio: { source: 'tiktok', medium: 'bio' },
    video: { source: 'tiktok', medium: 'video' },
    comment: { source: 'tiktok', medium: 'comment' },
  },
  twitter: {
    bio: { source: 'twitter', medium: 'bio' },
    tweet: { source: 'twitter', medium: 'tweet' },
    dm: { source: 'twitter', medium: 'dm' },
  },
  snapchat: {
    story: { source: 'snapchat', medium: 'story' },
    spotlight: { source: 'snapchat', medium: 'spotlight' },
  },
} as const;

/**
 * Gets suggested UTM parameters based on common patterns
 *
 * @param platform - Social media platform
 * @param placement - Where the link will be placed
 * @returns Suggested UTM parameters
 */
export function getSuggestedUTM(
  platform: keyof typeof UTM_PRESETS,
  placement: string
): { source: string; medium: string } | null {
  const platformPresets = UTM_PRESETS[platform];
  if (!platformPresets) return null;

  // @ts-expect-error - Dynamic key access
  return platformPresets[placement] || null;
}
