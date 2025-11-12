/**
 * Service Worker for Push Notifications
 *
 * Handles:
 * - Push events (receiving notifications from server)
 * - Notification click events (opening app when notification clicked)
 * - Service worker lifecycle (install, activate)
 */

// Service worker version (increment on updates)
const SW_VERSION = '1.0.0';
const CACHE_NAME = `nglfs-sw-v${SW_VERSION}`;

// App URL for navigation
const APP_URL = self.location.origin;

// =====================================================
// Service Worker Lifecycle Events
// =====================================================

/**
 * Install event - activate immediately
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing version:', SW_VERSION);
  // Skip waiting to activate immediately
  self.skipWaiting();
});

/**
 * Activate event - take control of all clients
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating version:', SW_VERSION);

  event.waitUntil(
    (async () => {
      // Clean up old caches if any
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );

      // Take control of all clients immediately
      await self.clients.claim();
    })()
  );
});

// =====================================================
// Push Notification Handling
// =====================================================

/**
 * Push event - received when server sends a notification
 */
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push event received');

  if (!event.data) {
    console.warn('[Service Worker] Push event has no data');
    return;
  }

  try {
    // Parse notification payload
    const payload = event.data.json();
    console.log('[Service Worker] Push payload:', payload);

    // Extract notification data
    const { title, body, icon, badge, tag, data, requireInteraction } = payload;

    // Show notification
    event.waitUntil(
      self.registration.showNotification(title || 'New Notification', {
        body: body || 'You have a new notification',
        icon: icon || `${APP_URL}/icon-192x192.png`,
        badge: badge || `${APP_URL}/icon-96x96.png`,
        tag: tag || 'nglfs-notification',
        data: data || {},
        requireInteraction: requireInteraction || false,
        vibrate: [200, 100, 200], // Vibration pattern (mobile)
        actions: [
          {
            action: 'view',
            title: 'View',
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
          },
        ],
      })
    );
  } catch (error) {
    console.error('[Service Worker] Error handling push event:', error);

    // Show generic notification on error
    event.waitUntil(
      self.registration.showNotification('New Notification', {
        body: 'You have a new notification',
        icon: `${APP_URL}/icon-192x192.png`,
        tag: 'nglfs-error',
      })
    );
  }
});

// =====================================================
// Notification Click Handling
// =====================================================

/**
 * Notification click event - handle when user clicks notification
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  // Close the notification
  notification.close();

  // Handle different actions
  if (action === 'dismiss') {
    console.log('[Service Worker] Notification dismissed');
    return;
  }

  // Default action or 'view' action: open the app
  event.waitUntil(
    (async () => {
      // Determine URL to open
      let urlToOpen = APP_URL;

      // If we have message data, open directly to message
      if (data.type === 'message' && data.messageId) {
        urlToOpen = `${APP_URL}/dashboard/messages/${data.messageId}`;
      } else {
        // Default to messages page
        urlToOpen = `${APP_URL}/dashboard/messages`;
      }

      // Try to find an existing window/tab
      const allClients = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // Check if there's already a window open
      for (const client of allClients) {
        if (client.url.startsWith(APP_URL) && 'focus' in client) {
          // Focus existing window and navigate to URL
          await client.focus();
          if (client.navigate) {
            await client.navigate(urlToOpen);
          }
          return;
        }
      }

      // No existing window found, open new one
      if (clients.openWindow) {
        await clients.openWindow(urlToOpen);
      }
    })()
  );
});

// =====================================================
// Background Sync (Future Enhancement)
// =====================================================

/**
 * Sync event - for background sync when online
 * (Not currently used, but prepared for future features)
 */
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sync event:', event.tag);

  if (event.tag === 'sync-messages') {
    event.waitUntil(
      // Future: Sync messages in background
      Promise.resolve()
    );
  }
});

// =====================================================
// Message Handling (from client)
// =====================================================

/**
 * Message event - handle messages from client (main app)
 */
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      // Force service worker to activate immediately
      self.skipWaiting();
      break;

    case 'CLIENTS_CLAIM':
      // Take control of all clients
      self.clients.claim();
      break;

    case 'GET_VERSION':
      // Respond with current version
      event.ports[0].postMessage({ version: SW_VERSION });
      break;

    default:
      console.warn('[Service Worker] Unknown message type:', type);
  }
});

// =====================================================
// Error Handling
// =====================================================

/**
 * Global error handler
 */
self.addEventListener('error', (event) => {
  console.error('[Service Worker] Error:', event.error);
});

/**
 * Unhandled rejection handler
 */
self.addEventListener('unhandledrejection', (event) => {
  console.error('[Service Worker] Unhandled rejection:', event.reason);
});

// =====================================================
// Logging
// =====================================================

console.log('[Service Worker] Loaded version:', SW_VERSION);
console.log('[Service Worker] Origin:', APP_URL);
