/**
 * Notification Types and Interfaces
 *
 * Type definitions for the push notification system including:
 * - Push subscriptions (Web Push API standard)
 * - User notification preferences
 * - Notification payloads
 */

// =====================================================
// Push Subscription Types (Web Push API standard)
// =====================================================

/**
 * Push subscription keys for encryption
 */
export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

/**
 * Push subscription data (matches Web Push API PushSubscription)
 */
export interface PushSubscriptionData {
  endpoint: string;
  keys: PushSubscriptionKeys;
  expirationTime: number | null;
}

/**
 * Database push subscription record
 */
export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  subscription_data: PushSubscriptionData;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Notification Preferences
// =====================================================

/**
 * User notification preference settings
 */
export interface NotificationPreferences {
  /** Whether push notifications are enabled */
  enabled: boolean;

  /** Whether to show message preview in notification (true) or just alert (false) */
  show_preview: boolean;

  /** Whether the permission prompt has been shown to user */
  prompt_shown: boolean;

  /** Timestamp when user granted permission (ISO string) */
  permission_granted_at: string | null;
}

/**
 * Default notification preferences for new users
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: false,
  show_preview: false,
  prompt_shown: false,
  permission_granted_at: null,
};

// =====================================================
// Notification Payload Types
// =====================================================

/**
 * Content mode for notifications
 */
export type NotificationContentMode = 'preview' | 'private';

/**
 * Notification payload for new message (preview mode)
 */
export interface MessageNotificationPreview {
  type: 'message';
  mode: 'preview';
  messageId: string;
  content: string; // First 100 characters
  timestamp: string;
}

/**
 * Notification payload for new message (private mode)
 */
export interface MessageNotificationPrivate {
  type: 'message';
  mode: 'private';
  messageId: string;
  timestamp: string;
}

/**
 * Union type for all notification payloads
 */
export type NotificationPayload = MessageNotificationPreview | MessageNotificationPrivate;

// =====================================================
// Notification Display Options
// =====================================================

/**
 * Options for displaying a notification
 */
export interface NotificationDisplayOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: NotificationPayload;
  requireInteraction?: boolean;
  silent?: boolean;
}

// =====================================================
// Browser Permission States
// =====================================================

/**
 * Browser notification permission state
 * (matches NotificationPermission from Web API)
 */
export type NotificationPermissionState = 'default' | 'granted' | 'denied';

// =====================================================
// API Request/Response Types
// =====================================================

/**
 * Request to subscribe to push notifications
 */
export interface SubscribeRequest {
  subscription: PushSubscriptionData;
}

/**
 * Response from subscribe API
 */
export interface SubscribeResponse {
  success: boolean;
  subscriptionId?: string;
  error?: string;
}

/**
 * Request to unsubscribe from push notifications
 */
export interface UnsubscribeRequest {
  endpoint: string;
}

/**
 * Response from unsubscribe API
 */
export interface UnsubscribeResponse {
  success: boolean;
  error?: string;
}

/**
 * Request to update notification preferences
 */
export interface UpdatePreferencesRequest {
  preferences: Partial<NotificationPreferences>;
}

/**
 * Response from update preferences API
 */
export interface UpdatePreferencesResponse {
  success: boolean;
  preferences?: NotificationPreferences;
  error?: string;
}

/**
 * Request to send a test notification
 */
export interface SendTestNotificationRequest {
  mode?: NotificationContentMode;
}

/**
 * Response from send test notification API
 */
export interface SendTestNotificationResponse {
  success: boolean;
  sent: boolean;
  error?: string;
}

// =====================================================
// Service Worker Message Types
// =====================================================

/**
 * Message types sent to service worker
 */
export type ServiceWorkerMessageType =
  | 'SKIP_WAITING'
  | 'CLIENTS_CLAIM'
  | 'NOTIFICATION_CLICKED';

/**
 * Message sent to service worker
 */
export interface ServiceWorkerMessage {
  type: ServiceWorkerMessageType;
  payload?: unknown;
}

// =====================================================
// Notification Statistics
// =====================================================

/**
 * Notification statistics for a user
 */
export interface NotificationStats {
  user_id: string;
  username: string;
  notifications_enabled: boolean;
  show_preview: boolean;
  prompt_shown: boolean;
  permission_granted_at: string | null;
  active_subscriptions: number;
  latest_subscription_date: string | null;
}

// =====================================================
// Error Types
// =====================================================

/**
 * Notification-specific error codes
 */
export enum NotificationErrorCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  SUBSCRIPTION_FAILED = 'SUBSCRIPTION_FAILED',
  INVALID_SUBSCRIPTION = 'INVALID_SUBSCRIPTION',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Notification error
 */
export class NotificationError extends Error {
  constructor(
    public code: NotificationErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'NotificationError';
  }
}
