import { UAParser } from 'ua-parser-js';

/**
 * User-Agent Parsing Utilities
 *
 * Extracts browser, device, and OS information from User-Agent strings
 * for analytics and device-specific optimizations.
 */

export interface ParsedUserAgent {
  browser: {
    name: string | undefined;
    version: string | undefined;
    fullName: string;
  };
  os: {
    name: string | undefined;
    version: string | undefined;
    fullName: string;
  };
  device: {
    type: 'mobile' | 'tablet' | 'desktop' | 'unknown';
    vendor: string | undefined;
    model: string | undefined;
    fullName: string;
  };
  raw: string;
}

/**
 * Parses a User-Agent string into structured device information
 *
 * @param userAgentString - Raw User-Agent header from request
 * @returns Structured device/browser/OS information
 */
export function parseUserAgent(userAgentString: string): ParsedUserAgent {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();

  // Determine device type (desktop is default if not specified)
  let deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'desktop';
  if (result.device.type === 'mobile') deviceType = 'mobile';
  else if (result.device.type === 'tablet') deviceType = 'tablet';
  else if (result.device.type) deviceType = 'unknown';

  return {
    browser: {
      name: result.browser.name,
      version: result.browser.version,
      fullName: result.browser.name
        ? `${result.browser.name} ${result.browser.version || ''}`
        : 'Unknown Browser',
    },
    os: {
      name: result.os.name,
      version: result.os.version,
      fullName: result.os.name
        ? `${result.os.name} ${result.os.version || ''}`
        : 'Unknown OS',
    },
    device: {
      type: deviceType,
      vendor: result.device.vendor,
      model: result.device.model,
      fullName:
        result.device.vendor && result.device.model
          ? `${result.device.vendor} ${result.device.model}`
          : deviceType.charAt(0).toUpperCase() + deviceType.slice(1),
    },
    raw: userAgentString,
  };
}

/**
 * Extracts User-Agent string from Next.js request headers
 *
 * @param headers - Next.js request headers
 * @returns User-Agent string or generic fallback
 */
export function getUserAgent(headers: Headers): string {
  return headers.get('user-agent') || 'Unknown';
}

/**
 * Complete parsing flow: Extract User-Agent from headers and parse it
 *
 * @param headers - Next.js request headers
 * @returns Parsed device information
 */
export function getParsedUserAgent(headers: Headers): ParsedUserAgent {
  const userAgentString = getUserAgent(headers);
  return parseUserAgent(userAgentString);
}

/**
 * Checks if the device is mobile (phone or tablet)
 *
 * @param userAgent - Parsed user agent or raw string
 * @returns True if mobile device
 */
export function isMobileDevice(userAgent: ParsedUserAgent | string): boolean {
  if (typeof userAgent === 'string') {
    const parsed = parseUserAgent(userAgent);
    return parsed.device.type === 'mobile' || parsed.device.type === 'tablet';
  }
  return userAgent.device.type === 'mobile' || userAgent.device.type === 'tablet';
}

/**
 * Gets a simple device category for analytics
 *
 * @param userAgent - Parsed user agent
 * @returns Simplified category
 */
export function getDeviceCategory(userAgent: ParsedUserAgent): string {
  switch (userAgent.device.type) {
    case 'mobile':
      return 'Mobile';
    case 'tablet':
      return 'Tablet';
    case 'desktop':
      return 'Desktop';
    default:
      return 'Unknown';
  }
}

/**
 * Gets simplified browser family (Chrome-based, Safari, Firefox, etc.)
 *
 * @param userAgent - Parsed user agent
 * @returns Browser family
 */
export function getBrowserFamily(userAgent: ParsedUserAgent): string {
  const name = userAgent.browser.name?.toLowerCase() || '';

  // Chrome-based browsers
  if (name.includes('chrome') || name.includes('edge') || name.includes('brave')) {
    return 'Chromium';
  }

  // Safari-based
  if (name.includes('safari') || name.includes('webkit')) {
    return 'Safari';
  }

  // Firefox-based
  if (name.includes('firefox')) {
    return 'Firefox';
  }

  return userAgent.browser.name || 'Other';
}

/**
 * Gets simplified OS family
 *
 * @param userAgent - Parsed user agent
 * @returns OS family
 */
export function getOSFamily(userAgent: ParsedUserAgent): string {
  const name = userAgent.os.name?.toLowerCase() || '';

  if (name.includes('ios') || name.includes('mac')) return 'Apple';
  if (name.includes('android')) return 'Android';
  if (name.includes('windows')) return 'Windows';
  if (name.includes('linux')) return 'Linux';

  return userAgent.os.name || 'Other';
}
