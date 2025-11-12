/**
 * Timezone to Country/Region Mapping
 * Maps IANA timezone strings to countries and regions for display purposes
 * Privacy-safe: No IP geolocation, only timezone inference
 */

export interface CountryInfo {
  country: string;
  region: string;
  flag: string;
  displayName: string;
}

/**
 * Comprehensive timezone to country mapping
 * Based on IANA timezone database
 */
const TIMEZONE_TO_COUNTRY: Record<string, CountryInfo> = {
  // Asia
  'Asia/Katmandu': { country: 'Nepal', region: 'Asia', flag: '🇳🇵', displayName: 'Nepal' },
  'Asia/Kathmandu': { country: 'Nepal', region: 'Asia', flag: '🇳🇵', displayName: 'Nepal' },
  'Asia/Kolkata': { country: 'India', region: 'Asia', flag: '🇮🇳', displayName: 'India' },
  'Asia/Calcutta': { country: 'India', region: 'Asia', flag: '🇮🇳', displayName: 'India' },
  'Asia/Tokyo': { country: 'Japan', region: 'Asia', flag: '🇯🇵', displayName: 'Japan' },
  'Asia/Seoul': { country: 'South Korea', region: 'Asia', flag: '🇰🇷', displayName: 'South Korea' },
  'Asia/Shanghai': { country: 'China', region: 'Asia', flag: '🇨🇳', displayName: 'China' },
  'Asia/Hong_Kong': { country: 'Hong Kong', region: 'Asia', flag: '🇭🇰', displayName: 'Hong Kong' },
  'Asia/Singapore': { country: 'Singapore', region: 'Asia', flag: '🇸🇬', displayName: 'Singapore' },
  'Asia/Bangkok': { country: 'Thailand', region: 'Asia', flag: '🇹🇭', displayName: 'Thailand' },
  'Asia/Manila': { country: 'Philippines', region: 'Asia', flag: '🇵🇭', displayName: 'Philippines' },
  'Asia/Dubai': { country: 'UAE', region: 'Middle East', flag: '🇦🇪', displayName: 'United Arab Emirates' },
  'Asia/Karachi': { country: 'Pakistan', region: 'Asia', flag: '🇵🇰', displayName: 'Pakistan' },
  'Asia/Dhaka': { country: 'Bangladesh', region: 'Asia', flag: '🇧🇩', displayName: 'Bangladesh' },
  'Asia/Jakarta': { country: 'Indonesia', region: 'Asia', flag: '🇮🇩', displayName: 'Indonesia' },
  'Asia/Kuala_Lumpur': { country: 'Malaysia', region: 'Asia', flag: '🇲🇾', displayName: 'Malaysia' },
  'Asia/Tel_Aviv': { country: 'Israel', region: 'Middle East', flag: '🇮🇱', displayName: 'Israel' },
  'Asia/Jerusalem': { country: 'Israel', region: 'Middle East', flag: '🇮🇱', displayName: 'Israel' },

  // Americas
  'America/New_York': { country: 'USA', region: 'North America', flag: '🇺🇸', displayName: 'United States (Eastern)' },
  'America/Chicago': { country: 'USA', region: 'North America', flag: '🇺🇸', displayName: 'United States (Central)' },
  'America/Denver': { country: 'USA', region: 'North America', flag: '🇺🇸', displayName: 'United States (Mountain)' },
  'America/Los_Angeles': { country: 'USA', region: 'North America', flag: '🇺🇸', displayName: 'United States (Pacific)' },
  'America/Phoenix': { country: 'USA', region: 'North America', flag: '🇺🇸', displayName: 'United States (Arizona)' },
  'America/Toronto': { country: 'Canada', region: 'North America', flag: '🇨🇦', displayName: 'Canada (Eastern)' },
  'America/Vancouver': { country: 'Canada', region: 'North America', flag: '🇨🇦', displayName: 'Canada (Pacific)' },
  'America/Mexico_City': { country: 'Mexico', region: 'North America', flag: '🇲🇽', displayName: 'Mexico' },
  'America/Sao_Paulo': { country: 'Brazil', region: 'South America', flag: '🇧🇷', displayName: 'Brazil' },
  'America/Buenos_Aires': { country: 'Argentina', region: 'South America', flag: '🇦🇷', displayName: 'Argentina' },
  'America/Bogota': { country: 'Colombia', region: 'South America', flag: '🇨🇴', displayName: 'Colombia' },
  'America/Lima': { country: 'Peru', region: 'South America', flag: '🇵🇪', displayName: 'Peru' },
  'America/Santiago': { country: 'Chile', region: 'South America', flag: '🇨🇱', displayName: 'Chile' },

  // Europe
  'Europe/London': { country: 'United Kingdom', region: 'Europe', flag: '🇬🇧', displayName: 'United Kingdom' },
  'Europe/Paris': { country: 'France', region: 'Europe', flag: '🇫🇷', displayName: 'France' },
  'Europe/Berlin': { country: 'Germany', region: 'Europe', flag: '🇩🇪', displayName: 'Germany' },
  'Europe/Rome': { country: 'Italy', region: 'Europe', flag: '🇮🇹', displayName: 'Italy' },
  'Europe/Madrid': { country: 'Spain', region: 'Europe', flag: '🇪🇸', displayName: 'Spain' },
  'Europe/Amsterdam': { country: 'Netherlands', region: 'Europe', flag: '🇳🇱', displayName: 'Netherlands' },
  'Europe/Brussels': { country: 'Belgium', region: 'Europe', flag: '🇧🇪', displayName: 'Belgium' },
  'Europe/Zurich': { country: 'Switzerland', region: 'Europe', flag: '🇨🇭', displayName: 'Switzerland' },
  'Europe/Vienna': { country: 'Austria', region: 'Europe', flag: '🇦🇹', displayName: 'Austria' },
  'Europe/Stockholm': { country: 'Sweden', region: 'Europe', flag: '🇸🇪', displayName: 'Sweden' },
  'Europe/Oslo': { country: 'Norway', region: 'Europe', flag: '🇳🇴', displayName: 'Norway' },
  'Europe/Copenhagen': { country: 'Denmark', region: 'Europe', flag: '🇩🇰', displayName: 'Denmark' },
  'Europe/Helsinki': { country: 'Finland', region: 'Europe', flag: '🇫🇮', displayName: 'Finland' },
  'Europe/Warsaw': { country: 'Poland', region: 'Europe', flag: '🇵🇱', displayName: 'Poland' },
  'Europe/Prague': { country: 'Czech Republic', region: 'Europe', flag: '🇨🇿', displayName: 'Czech Republic' },
  'Europe/Budapest': { country: 'Hungary', region: 'Europe', flag: '🇭🇺', displayName: 'Hungary' },
  'Europe/Athens': { country: 'Greece', region: 'Europe', flag: '🇬🇷', displayName: 'Greece' },
  'Europe/Moscow': { country: 'Russia', region: 'Europe', flag: '🇷🇺', displayName: 'Russia (Moscow)' },
  'Europe/Istanbul': { country: 'Turkey', region: 'Europe', flag: '🇹🇷', displayName: 'Turkey' },

  // Oceania
  'Australia/Sydney': { country: 'Australia', region: 'Oceania', flag: '🇦🇺', displayName: 'Australia (Sydney)' },
  'Australia/Melbourne': { country: 'Australia', region: 'Oceania', flag: '🇦🇺', displayName: 'Australia (Melbourne)' },
  'Australia/Perth': { country: 'Australia', region: 'Oceania', flag: '🇦🇺', displayName: 'Australia (Perth)' },
  'Australia/Brisbane': { country: 'Australia', region: 'Oceania', flag: '🇦🇺', displayName: 'Australia (Brisbane)' },
  'Pacific/Auckland': { country: 'New Zealand', region: 'Oceania', flag: '🇳🇿', displayName: 'New Zealand' },

  // Africa
  'Africa/Cairo': { country: 'Egypt', region: 'Africa', flag: '🇪🇬', displayName: 'Egypt' },
  'Africa/Johannesburg': { country: 'South Africa', region: 'Africa', flag: '🇿🇦', displayName: 'South Africa' },
  'Africa/Lagos': { country: 'Nigeria', region: 'Africa', flag: '🇳🇬', displayName: 'Nigeria' },
  'Africa/Nairobi': { country: 'Kenya', region: 'Africa', flag: '🇰🇪', displayName: 'Kenya' },
  'Africa/Casablanca': { country: 'Morocco', region: 'Africa', flag: '🇲🇦', displayName: 'Morocco' },
  'Africa/Algiers': { country: 'Algeria', region: 'Africa', flag: '🇩🇿', displayName: 'Algeria' },

  // Special cases
  'GMT': { country: 'GMT', region: 'Global', flag: '🌍', displayName: 'Greenwich Mean Time' },
  'UTC': { country: 'UTC', region: 'Global', flag: '🌍', displayName: 'Coordinated Universal Time' },
};

/**
 * Get country information from timezone string
 * @param timezone IANA timezone string (e.g., "Asia/Katmandu")
 * @returns CountryInfo object or null if not found
 */
export function getCountryFromTimezone(timezone: string | null | undefined): CountryInfo | null {
  if (!timezone) return null;

  // Direct lookup
  if (TIMEZONE_TO_COUNTRY[timezone]) {
    return TIMEZONE_TO_COUNTRY[timezone];
  }

  // Try to infer from timezone prefix
  return inferFromTimezone(timezone);
}

/**
 * Infer country/region from timezone prefix when exact match not found
 * @param timezone IANA timezone string
 * @returns Inferred CountryInfo or generic regional info
 */
function inferFromTimezone(timezone: string): CountryInfo | null {
  // Extract continent/region from timezone
  const parts = timezone.split('/');
  if (parts.length < 2) return null;

  const continent = parts[0];
  const location = parts[1].replace(/_/g, ' ');

  // Map continents to regions and flags
  const continentMap: Record<string, { region: string; flag: string }> = {
    'America': { region: 'Americas', flag: '🌎' },
    'Europe': { region: 'Europe', flag: '🇪🇺' },
    'Asia': { region: 'Asia', flag: '🌏' },
    'Africa': { region: 'Africa', flag: '🌍' },
    'Australia': { region: 'Oceania', flag: '🇦🇺' },
    'Pacific': { region: 'Oceania', flag: '🌊' },
    'Antarctica': { region: 'Antarctica', flag: '🇦🇶' },
    'Atlantic': { region: 'Atlantic', flag: '🌊' },
    'Indian': { region: 'Indian Ocean', flag: '🌊' },
  };

  const continentInfo = continentMap[continent];
  if (!continentInfo) {
    return {
      country: location,
      region: 'Unknown',
      flag: '🌐',
      displayName: location,
    };
  }

  return {
    country: location,
    region: continentInfo.region,
    flag: continentInfo.flag,
    displayName: `${location} (${continentInfo.region})`,
  };
}

/**
 * Get region from timezone (broader classification)
 * @param timezone IANA timezone string
 * @returns Region name
 */
export function getRegionFromTimezone(timezone: string | null | undefined): string {
  if (!timezone) return 'Unknown';

  const countryInfo = getCountryFromTimezone(timezone);
  return countryInfo?.region || 'Unknown';
}

/**
 * Get flag emoji from timezone
 * @param timezone IANA timezone string
 * @returns Flag emoji or world emoji
 */
export function getFlagFromTimezone(timezone: string | null | undefined): string {
  if (!timezone) return '🌐';

  const countryInfo = getCountryFromTimezone(timezone);
  return countryInfo?.flag || '🌐';
}

/**
 * Format timezone for display with country/flag
 * @param timezone IANA timezone string
 * @returns Formatted string like "🇳🇵 Asia/Katmandu (Nepal)"
 */
export function formatTimezoneDisplay(timezone: string | null | undefined): string {
  if (!timezone) return 'Unknown';

  const countryInfo = getCountryFromTimezone(timezone);
  if (!countryInfo) return timezone;

  return `${countryInfo.flag} ${countryInfo.displayName}`;
}

/**
 * Get local time for a timezone at a specific UTC timestamp
 * @param utcTimestamp ISO 8601 timestamp
 * @param timezone IANA timezone string
 * @returns Formatted local time string
 */
export function getLocalTimeForTimezone(
  utcTimestamp: string,
  timezone: string | null | undefined
): string {
  if (!timezone) return 'Unknown';

  try {
    const date = new Date(utcTimestamp);
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch (error) {
    console.error('Error formatting local time:', error);
    return 'Unknown';
  }
}

/**
 * Calculate timezone offset from UTC in hours
 * @param timezone IANA timezone string
 * @returns Offset in hours (e.g., +5.75 for Asia/Katmandu)
 */
export function getTimezoneOffset(timezone: string | null | undefined): number | null {
  if (!timezone) return null;

  try {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const offset = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
    return offset;
  } catch (error) {
    console.error('Error calculating timezone offset:', error);
    return null;
  }
}
