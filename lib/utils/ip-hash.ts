import crypto from 'crypto';

/**
 * GDPR/CCPA Compliant IP Hashing Utilities
 *
 * This module provides privacy-preserving IP address hashing that:
 * 1. Truncates IP addresses to remove identifying information
 * 2. Uses daily rotating salts to prevent long-term tracking
 * 3. Maintains rate limiting capabilities within the same day
 * 4. Complies with GDPR Article 6 and CCPA requirements
 */

/**
 * Anonymizes an IPv4 address by truncating the last octet
 * Example: 192.168.178.123 → 192.168.178.0
 *
 * This reduces uniqueness from ~4.3B possible addresses to /24 network ranges,
 * making it truly anonymous while preserving general geographic location.
 *
 * @param ip - IPv4 or IPv6 address
 * @returns Truncated IP address
 */
export function anonymizeIP(ip: string): string {
  // Handle IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = '0'; // Remove last octet
      return parts.join('.');
    }
  }

  // Handle IPv6 - truncate last 64 bits
  if (ip.includes(':')) {
    const parts = ip.split(':');
    // Keep first 4 groups (64 bits), zero out the rest
    const truncated = parts.slice(0, 4).join(':');
    return `${truncated}::`;
  }

  return ip; // Fallback
}

/**
 * Generates a daily rotating salt based on current date
 * Salt changes at midnight UTC, preventing cross-day tracking
 *
 * @returns SHA-256 hash of current date + secret salt
 */
function getDailySalt(): string {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const secret = process.env.IP_SALT_SECRET || 'default-secret-change-in-production';

  return crypto
    .createHash('sha256')
    .update(today + secret)
    .digest('hex');
}

/**
 * Creates a privacy-compliant hash of an IP address
 *
 * Security features:
 * - IP truncation removes identifying information
 * - Daily salt prevents long-term tracking
 * - SHA-256 ensures one-way hashing
 * - Rate limiting works within 24-hour windows
 *
 * @param ip - Raw IP address from request
 * @returns Privacy-preserving hash
 */
export function hashIPPrivacyCompliant(ip: string): string {
  const truncated = anonymizeIP(ip);
  const salt = getDailySalt();

  return crypto
    .createHash('sha256')
    .update(truncated + salt)
    .digest('hex');
}

/**
 * Legacy hashing function (less privacy-preserving)
 *
 * ⚠️ WARNING: This method is NOT GDPR compliant as full IP addresses
 * can be brute-forced. Use hashIPPrivacyCompliant() instead.
 *
 * Kept for backward compatibility only.
 *
 * @deprecated Use hashIPPrivacyCompliant() instead
 * @param ip - Raw IP address
 * @returns SHA-256 hash
 */
export function hashIPLegacy(ip: string): string {
  return crypto
    .createHash('sha256')
    .update(ip)
    .digest('hex');
}

/**
 * Extracts IP address from Next.js request headers
 * Handles proxies, load balancers, and Cloudflare
 *
 * @param headers - Next.js request headers
 * @returns Client IP address
 */
export function getClientIP(headers: Headers): string {
  // Check common proxy headers (in order of preference)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
    return forwardedFor.split(',')[0].trim();
  }

  // Cloudflare
  const cfConnectingIP = headers.get('cf-connecting-ip');
  if (cfConnectingIP) return cfConnectingIP;

  // Other proxy headers
  const realIP = headers.get('x-real-ip');
  if (realIP) return realIP;

  // Fallback to connection IP (less reliable)
  return headers.get('x-client-ip') || '0.0.0.0';
}

/**
 * Complete tracking flow: Extract IP from headers and hash it
 *
 * @param headers - Next.js request headers
 * @returns Privacy-compliant IP hash
 */
export function getHashedIP(headers: Headers): string {
  const clientIP = getClientIP(headers);
  return hashIPPrivacyCompliant(clientIP);
}
