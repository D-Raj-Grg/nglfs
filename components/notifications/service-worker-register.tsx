/**
 * Service Worker Registration Component
 *
 * Automatically registers the service worker for push notifications
 * This should be included in the root layout to ensure early registration
 */

'use client';

import { useEffect } from 'react';
import { registerServiceWorker, isNotificationSupported } from '@/lib/notifications/client';

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register in browser environment
    if (typeof window === 'undefined') return;

    // Check if notifications are supported
    if (!isNotificationSupported()) {
      console.log('[ServiceWorker] Push notifications not supported');
      return;
    }

    // Register service worker on mount
    registerServiceWorker()
      .then((registration) => {
        if (registration) {
          console.log('[ServiceWorker] Registered successfully');
        } else {
          console.log('[ServiceWorker] Registration failed');
        }
      })
      .catch((error) => {
        console.error('[ServiceWorker] Registration error:', error);
      });
  }, []);

  // This component renders nothing
  return null;
}
