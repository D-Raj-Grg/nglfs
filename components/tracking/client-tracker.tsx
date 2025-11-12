'use client';

import { useEffect, useRef } from 'react';

/**
 * Client-side tracking data that can only be collected via JavaScript
 */
export interface ClientTrackingData {
  /** User's timezone (e.g., "America/New_York") */
  timezone: string;
  /** Browser language preference (e.g., "en-US") */
  language: string;
  /** Screen resolution (e.g., "1920x1080") */
  screenResolution: string;
  /** Color depth in bits */
  colorDepth: number;
  /** Does device support touch? */
  touchSupport: boolean;
  /** Viewport size (visible area) */
  viewportSize: string;
  /** Connection type if available */
  connectionType: string | null;
  /** Device pixel ratio (for Retina displays) */
  pixelRatio: number;
  /** Available screen size (excluding OS taskbars) */
  availableScreen: string;
}

/**
 * Collects client-side tracking data from browser APIs
 *
 * @returns Privacy-friendly device information
 */
export function collectClientTrackingData(): ClientTrackingData {
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
    language: navigator.language || 'Unknown',
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth || 0,
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    connectionType: getConnectionType(),
    pixelRatio: window.devicePixelRatio || 1,
    availableScreen: `${screen.availWidth}x${screen.availHeight}`,
  };
}

/**
 * Gets network connection type if available (Network Information API)
 */
function getConnectionType(): string | null {
  // @ts-expect-error - Network Information API is not in TypeScript types
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (connection?.effectiveType) {
    return connection.effectiveType; // '4g', '3g', '2g', 'slow-2g'
  }

  return null;
}

/**
 * Props for ClientTracker component
 */
interface ClientTrackerProps {
  /** Profile ID or username being viewed */
  profileId: string;
  /** API endpoint to send tracking data to */
  endpoint?: string;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * ClientTracker Component
 *
 * Invisible component that collects client-side tracking data and sends it
 * to an analytics endpoint. Should be placed on profile pages.
 *
 * Usage:
 * ```tsx
 * <ClientTracker profileId="john" endpoint="/api/analytics/track-visit" />
 * ```
 */
export function ClientTracker({
  profileId,
  endpoint = '/api/analytics/track-visit',
  debug = false,
}: ClientTrackerProps) {
  const hasSent = useRef(false);

  useEffect(() => {
    // Prevent duplicate tracking on hot reload or re-renders
    if (hasSent.current) return;
    hasSent.current = true;

    // Collect tracking data
    const trackingData = collectClientTrackingData();

    if (debug) {
      console.log('[ClientTracker] Collected data:', trackingData);
    }

    // Send to analytics endpoint
    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profileId,
        clientData: trackingData,
        timestamp: new Date().toISOString(),
      }),
      // Don't wait for response (fire and forget)
      keepalive: true,
    })
      .then((res) => {
        if (debug) {
          console.log('[ClientTracker] Sent successfully:', res.status);
        }
      })
      .catch((err) => {
        if (debug) {
          console.error('[ClientTracker] Failed to send:', err);
        }
      });
  }, [profileId, endpoint, debug]);

  // Invisible component
  return null;
}

/**
 * Hook for collecting tracking data programmatically
 *
 * Usage:
 * ```tsx
 * const tracking = useClientTracking();
 * console.log(tracking.timezone); // "America/New_York"
 * ```
 */
export function useClientTracking(): ClientTrackingData {
  const [data, setData] = useState<ClientTrackingData | null>(null);

  useEffect(() => {
    setData(collectClientTrackingData());
  }, []);

  return data || {
    timezone: 'Unknown',
    language: 'Unknown',
    screenResolution: '0x0',
    colorDepth: 0,
    touchSupport: false,
    viewportSize: '0x0',
    connectionType: null,
    pixelRatio: 1,
    availableScreen: '0x0',
  };
}

// Export useState for the hook
import { useState } from 'react';

/**
 * Formats tracking data for display in analytics dashboards
 */
export function formatTrackingData(data: ClientTrackingData): string {
  return `${data.screenResolution} | ${data.timezone} | ${data.language}`;
}

/**
 * Checks if user is on a high-DPI display (Retina, 4K, etc.)
 */
export function isHighDPI(data: ClientTrackingData): boolean {
  return data.pixelRatio >= 2;
}

/**
 * Determines if user is on a mobile device based on viewport
 */
export function isMobileViewport(data: ClientTrackingData): boolean {
  const [width] = data.viewportSize.split('x').map(Number);
  return width <= 768;
}
