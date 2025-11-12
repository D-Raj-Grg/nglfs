/**
 * Client-Side Notification Library
 *
 * Handles all browser-side push notification operations:
 * - Feature detection
 * - Permission requests
 * - Subscription management
 * - Service worker registration
 */

import {
  NotificationPermissionState,
  PushSubscriptionData,
  NotificationError,
  NotificationErrorCode,
  SubscribeResponse,
  UnsubscribeResponse,
} from '@/lib/types/notifications.types';
import {
  SERVICE_WORKER_PATH,
  SERVICE_WORKER_SCOPE,
  NOTIFICATION_API_ENDPOINTS,
  isPushNotificationSupported,
  ERROR_MESSAGES,
  PROMPT_DISMISSAL_KEY,
  LAST_PROMPT_KEY,
  MAX_AUTO_PROMPT_COUNT,
  MIN_PROMPT_INTERVAL,
} from './constants';

// =====================================================
// Feature Detection
// =====================================================

/**
 * Check if push notifications are supported in this browser
 */
export function isNotificationSupported(): boolean {
  return isPushNotificationSupported();
}

/**
 * Get current notification permission state
 */
export function getNotificationPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission as NotificationPermissionState;
}

/**
 * Check if we should show the permission prompt
 * Based on dismissal count and time since last prompt
 */
export function shouldShowPrompt(): boolean {
  // Don't show if already granted or permanently denied
  const permission = getNotificationPermission();
  if (permission !== 'default') {
    return false;
  }

  // Check dismissal count
  const dismissalCount = getDismissalCount();
  if (dismissalCount >= MAX_AUTO_PROMPT_COUNT) {
    return false;
  }

  // Check time since last prompt
  const lastPrompt = getLastPromptTime();
  if (lastPrompt) {
    const timeSinceLastPrompt = Date.now() - lastPrompt;
    if (timeSinceLastPrompt < MIN_PROMPT_INTERVAL) {
      return false;
    }
  }

  return true;
}

// =====================================================
// Local Storage Helpers
// =====================================================

/**
 * Get number of times user has dismissed the prompt
 */
function getDismissalCount(): number {
  if (typeof window === 'undefined') return 0;

  const count = localStorage.getItem(PROMPT_DISMISSAL_KEY);
  return count ? parseInt(count, 10) : 0;
}

/**
 * Increment dismissal count
 */
export function incrementDismissalCount(): void {
  if (typeof window === 'undefined') return;

  const count = getDismissalCount();
  localStorage.setItem(PROMPT_DISMISSAL_KEY, String(count + 1));
  localStorage.setItem(LAST_PROMPT_KEY, String(Date.now()));
}

/**
 * Get timestamp of last prompt
 */
function getLastPromptTime(): number | null {
  if (typeof window === 'undefined') return null;

  const time = localStorage.getItem(LAST_PROMPT_KEY);
  return time ? parseInt(time, 10) : null;
}

/**
 * Reset dismissal tracking (e.g., when user grants permission)
 */
export function resetDismissalTracking(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(PROMPT_DISMISSAL_KEY);
  localStorage.removeItem(LAST_PROMPT_KEY);
}

// =====================================================
// Service Worker Registration
// =====================================================

/**
 * Register the service worker
 * Returns the registration or null if failed
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isNotificationSupported()) {
    console.warn('[Notifications] Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
      scope: SERVICE_WORKER_SCOPE,
    });

    console.log('[Notifications] Service worker registered:', registration);

    // Check for updates periodically
    registration.addEventListener('updatefound', () => {
      console.log('[Notifications] Service worker update found');
    });

    return registration;
  } catch (error) {
    console.error('[Notifications] Service worker registration failed:', error);
    return null;
  }
}

/**
 * Get the active service worker registration
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isNotificationSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    return registration;
  } catch (error) {
    console.error('[Notifications] Failed to get service worker registration:', error);
    return null;
  }
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      console.log('[Notifications] Service worker unregistered:', success);
      return success;
    }
    return false;
  } catch (error) {
    console.error('[Notifications] Failed to unregister service worker:', error);
    return false;
  }
}

// =====================================================
// Permission Management
// =====================================================

/**
 * Request notification permission from the user
 * Throws NotificationError if failed
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) {
    throw new NotificationError(
      NotificationErrorCode.NOT_SUPPORTED,
      ERROR_MESSAGES.NOT_SUPPORTED
    );
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      // Reset dismissal tracking on grant
      resetDismissalTracking();
    } else if (permission === 'denied') {
      // User denied permission
      incrementDismissalCount();
    }

    return permission as NotificationPermissionState;
  } catch (error) {
    console.error('[Notifications] Permission request failed:', error);
    throw new NotificationError(
      NotificationErrorCode.PERMISSION_DENIED,
      ERROR_MESSAGES.PERMISSION_DENIED
    );
  }
}

// =====================================================
// Push Subscription Management
// =====================================================

/**
 * Create a push subscription
 * Returns the subscription data in our format
 */
async function createPushSubscription(): Promise<PushSubscriptionData> {
  const registration = await getServiceWorkerRegistration();
  if (!registration) {
    throw new NotificationError(
      NotificationErrorCode.SUBSCRIPTION_FAILED,
      'Service worker not registered'
    );
  }

  // Get VAPID public key from environment
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    throw new NotificationError(
      NotificationErrorCode.SUBSCRIPTION_FAILED,
      'VAPID public key not configured'
    );
  }

  try {
    // Convert base64 VAPID key to Uint8Array
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey as BufferSource,
    });

    // Convert to our format
    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!),
      },
      expirationTime: subscription.expirationTime,
    };
  } catch (error) {
    console.error('[Notifications] Push subscription failed:', error);
    throw new NotificationError(
      NotificationErrorCode.SUBSCRIPTION_FAILED,
      ERROR_MESSAGES.SUBSCRIPTION_FAILED
    );
  }
}

/**
 * Subscribe user to push notifications
 * This creates a subscription and saves it to the server
 */
export async function subscribeUser(): Promise<SubscribeResponse> {
  // Check permission
  const permission = getNotificationPermission();
  if (permission !== 'granted') {
    throw new NotificationError(
      NotificationErrorCode.PERMISSION_DENIED,
      'Notification permission not granted'
    );
  }

  try {
    // Create push subscription
    const subscriptionData = await createPushSubscription();

    // Save to server
    const response = await fetch(NOTIFICATION_API_ENDPOINTS.SUBSCRIBE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscription: subscriptionData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save subscription');
    }

    const result: SubscribeResponse = await response.json();
    console.log('[Notifications] Subscription saved:', result);

    return result;
  } catch (error) {
    console.error('[Notifications] Subscribe failed:', error);

    if (error instanceof NotificationError) {
      throw error;
    }

    throw new NotificationError(
      NotificationErrorCode.NETWORK_ERROR,
      error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR
    );
  }
}

/**
 * Unsubscribe user from push notifications
 */
export async function unsubscribeUser(): Promise<UnsubscribeResponse> {
  const registration = await getServiceWorkerRegistration();
  if (!registration) {
    throw new NotificationError(
      NotificationErrorCode.SUBSCRIPTION_FAILED,
      'Service worker not registered'
    );
  }

  try {
    // Get current subscription
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      return { success: true }; // Already unsubscribed
    }

    // Unsubscribe from browser
    await subscription.unsubscribe();

    // Remove from server
    const response = await fetch(NOTIFICATION_API_ENDPOINTS.UNSUBSCRIBE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove subscription');
    }

    const result: UnsubscribeResponse = await response.json();
    console.log('[Notifications] Unsubscribed:', result);

    return result;
  } catch (error) {
    console.error('[Notifications] Unsubscribe failed:', error);

    if (error instanceof NotificationError) {
      throw error;
    }

    throw new NotificationError(
      NotificationErrorCode.NETWORK_ERROR,
      error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK_ERROR
    );
  }
}

/**
 * Check if user has an active subscription
 */
export async function hasActiveSubscription(): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }

  try {
    const registration = await getServiceWorkerRegistration();
    if (!registration) {
      return false;
    }

    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    console.error('[Notifications] Failed to check subscription:', error);
    return false;
  }
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * Convert URL-safe base64 to Uint8Array
 * (Required for VAPID key conversion)
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Convert ArrayBuffer to base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// =====================================================
// High-Level API
// =====================================================

/**
 * Complete flow to enable notifications
 * 1. Request permission
 * 2. Register service worker
 * 3. Create subscription
 * 4. Save to server
 */
export async function enableNotifications(): Promise<SubscribeResponse> {
  // Check support
  if (!isNotificationSupported()) {
    throw new NotificationError(
      NotificationErrorCode.NOT_SUPPORTED,
      ERROR_MESSAGES.NOT_SUPPORTED
    );
  }

  // Request permission
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    throw new NotificationError(
      NotificationErrorCode.PERMISSION_DENIED,
      ERROR_MESSAGES.PERMISSION_DENIED
    );
  }

  // Register service worker
  const registration = await registerServiceWorker();
  if (!registration) {
    throw new NotificationError(
      NotificationErrorCode.SUBSCRIPTION_FAILED,
      'Failed to register service worker'
    );
  }

  // Subscribe
  return await subscribeUser();
}

/**
 * Complete flow to disable notifications
 */
export async function disableNotifications(): Promise<UnsubscribeResponse> {
  return await unsubscribeUser();
}
