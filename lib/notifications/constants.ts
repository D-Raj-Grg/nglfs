/**
 * Notification Constants
 *
 * Configuration constants for the push notification system
 */

// =====================================================
// Service Worker Configuration
// =====================================================

/**
 * Service worker file path
 */
export const SERVICE_WORKER_PATH = '/sw.js';

/**
 * Service worker registration scope
 */
export const SERVICE_WORKER_SCOPE = '/';

/**
 * Service worker update check interval (in milliseconds)
 * Check for updates every 1 hour
 */
export const SERVICE_WORKER_UPDATE_INTERVAL = 60 * 60 * 1000;

// =====================================================
// Notification Content Configuration
// =====================================================

/**
 * Default notification icon (app logo)
 */
export const DEFAULT_NOTIFICATION_ICON = '/icon-192x192.png';

/**
 * Default notification badge (smaller icon for Android notification bar)
 */
export const DEFAULT_NOTIFICATION_BADGE = '/icon-96x96.png';

/**
 * Maximum length of message preview in notifications
 */
export const NOTIFICATION_PREVIEW_MAX_LENGTH = 100;

/**
 * Notification tag prefix (for replacing notifications)
 */
export const NOTIFICATION_TAG_PREFIX = 'nglfs-message-';

// =====================================================
// Notification Text Templates
// =====================================================

/**
 * Notification titles
 */
export const NOTIFICATION_TITLES = {
  NEW_MESSAGE_PREVIEW: 'New Anonymous Message',
  NEW_MESSAGE_PRIVATE: 'New Anonymous Message',
  TEST_NOTIFICATION: 'Test Notification',
} as const;

/**
 * Notification bodies
 */
export const NOTIFICATION_BODIES = {
  NEW_MESSAGE_PRIVATE: 'You have received a new anonymous message. Tap to read.',
  TEST_NOTIFICATION: 'This is a test notification. Your push notifications are working!',
} as const;

// =====================================================
// Permission Prompt Configuration
// =====================================================

/**
 * Maximum number of times to show permission prompt automatically
 * After this, user must enable manually in settings
 */
export const MAX_AUTO_PROMPT_COUNT = 3;

/**
 * Minimum time between auto-prompts (in milliseconds)
 * Wait at least 24 hours between automatic prompts
 */
export const MIN_PROMPT_INTERVAL = 24 * 60 * 60 * 1000;

/**
 * Local storage key for tracking prompt dismissals
 */
export const PROMPT_DISMISSAL_KEY = 'nglfs_notification_prompt_dismissals';

/**
 * Local storage key for last prompt timestamp
 */
export const LAST_PROMPT_KEY = 'nglfs_notification_last_prompt';

// =====================================================
// Subscription Configuration
// =====================================================

/**
 * Maximum age of subscriptions before they're considered expired (in days)
 * Subscriptions older than this will be cleaned up
 */
export const SUBSCRIPTION_MAX_AGE_DAYS = 90;

/**
 * Retry configuration for failed subscription saves
 */
export const SUBSCRIPTION_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  backoffMultiplier: 2, // Exponential backoff
} as const;

// =====================================================
// Rate Limiting Configuration
// =====================================================

/**
 * Maximum number of notifications a user can receive per hour
 * Prevents notification spam from rapid message senders
 */
export const MAX_NOTIFICATIONS_PER_HOUR = 10;

/**
 * Minimum time between notifications to same user (in milliseconds)
 * Batch messages received within this window
 */
export const MIN_NOTIFICATION_INTERVAL = 60 * 1000; // 1 minute

// =====================================================
// Feature Detection
// =====================================================

/**
 * Check if browser supports push notifications
 * Note: Must be called in browser environment only
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

// =====================================================
// Notification Actions
// =====================================================

/**
 * Notification actions (buttons shown in notification)
 */
export const NOTIFICATION_ACTIONS = {
  VIEW_MESSAGE: {
    action: 'view',
    title: 'View Message',
  },
  DISMISS: {
    action: 'dismiss',
    title: 'Dismiss',
  },
} as const;

// =====================================================
// API Endpoints
// =====================================================

/**
 * Notification API endpoints
 */
export const NOTIFICATION_API_ENDPOINTS = {
  SUBSCRIBE: '/api/notifications/subscribe',
  UNSUBSCRIBE: '/api/notifications/unsubscribe',
  PREFERENCES: '/api/notifications/preferences',
  TEST: '/api/notifications/test',
} as const;

// =====================================================
// Error Messages
// =====================================================

/**
 * User-facing error messages
 */
export const ERROR_MESSAGES = {
  NOT_SUPPORTED: 'Push notifications are not supported in your browser.',
  PERMISSION_DENIED: 'Notification permission was denied. Please enable notifications in your browser settings.',
  SUBSCRIPTION_FAILED: 'Failed to subscribe to notifications. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again later.',
} as const;

// =====================================================
// Success Messages
// =====================================================

/**
 * User-facing success messages
 */
export const SUCCESS_MESSAGES = {
  SUBSCRIPTION_CREATED: 'Notifications enabled successfully!',
  SUBSCRIPTION_REMOVED: 'Notifications disabled.',
  PREFERENCES_UPDATED: 'Notification preferences updated.',
  TEST_SENT: 'Test notification sent!',
} as const;
