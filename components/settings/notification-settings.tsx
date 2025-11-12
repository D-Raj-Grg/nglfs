/**
 * Notification Settings Panel
 *
 * Comprehensive settings panel for managing push notifications
 * Includes toggles, content mode selection, test button, and status indicators
 */

'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, Check, X, Loader2, AlertCircle, Send } from 'lucide-react';
import {
  enableNotifications,
  disableNotifications,
  getNotificationPermission,
  hasActiveSubscription,
  isNotificationSupported,
} from '@/lib/notifications/client';
import type { NotificationPreferences, NotificationPermissionState } from '@/lib/types/notifications.types';
import { NOTIFICATION_API_ENDPOINTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/notifications/constants';
import { toast } from 'sonner';

/**
 * Notification Settings Component
 */
export function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermissionState>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: false,
    show_preview: false,
    prompt_shown: false,
    permission_granted_at: null,
  });

  // Load initial state
  useEffect(() => {
    loadNotificationState();
  }, []);

  async function loadNotificationState() {
    setIsLoading(true);

    try {
      // Check browser support
      if (!isNotificationSupported()) {
        setIsLoading(false);
        return;
      }

      // Get permission status
      const currentPermission = getNotificationPermission();
      setPermission(currentPermission);

      // Check if has active subscription
      const hasSubscription = await hasActiveSubscription();
      setIsSubscribed(hasSubscription);

      // Fetch user preferences from server
      const response = await fetch(NOTIFICATION_API_ENDPOINTS.PREFERENCES);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (error) {
      console.error('[NotificationSettings] Failed to load state:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleNotifications(enabled: boolean) {
    setIsSaving(true);

    try {
      if (enabled) {
        // Enable notifications
        await enableNotifications();
        toast.success(SUCCESS_MESSAGES.SUBSCRIPTION_CREATED);
      } else {
        // Disable notifications
        await disableNotifications();
        toast.success(SUCCESS_MESSAGES.SUBSCRIPTION_REMOVED);
      }

      // Reload state
      await loadNotificationState();
    } catch (error: any) {
      console.error('[NotificationSettings] Toggle failed:', error);
      toast.error('Failed to update notifications', {
        description: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdatePreference(key: keyof NotificationPreferences, value: any) {
    setIsSaving(true);

    try {
      const response = await fetch(NOTIFICATION_API_ENDPOINTS.PREFERENCES, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: { [key]: value },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preference');
      }

      const data = await response.json();
      if (data.success && data.preferences) {
        setPreferences(data.preferences);
        toast.success(SUCCESS_MESSAGES.PREFERENCES_UPDATED);
      }
    } catch (error: any) {
      console.error('[NotificationSettings] Update failed:', error);
      toast.error('Failed to update preference', {
        description: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSendTest() {
    if (!isSubscribed) {
      toast.error('Please enable notifications first');
      return;
    }

    setIsTesting(true);

    try {
      const response = await fetch(NOTIFICATION_API_ENDPOINTS.TEST, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }

      const data = await response.json();
      if (data.success && data.sent) {
        toast.success(SUCCESS_MESSAGES.TEST_SENT, {
          description: 'Check your notifications!',
        });
      } else {
        throw new Error(data.error || 'Failed to send notification');
      }
    } catch (error: any) {
      console.error('[NotificationSettings] Test failed:', error);
      toast.error('Failed to send test notification', {
        description: error.message,
      });
    } finally {
      setIsTesting(false);
    }
  }

  // Check if notifications are not supported
  if (!isNotificationSupported()) {
    // Detect browser and platform
    const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = typeof window !== 'undefined' && /Android/.test(navigator.userAgent);
    const isSafari = typeof window !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isChrome = typeof window !== 'undefined' && /Chrome|CriOS/.test(navigator.userAgent);

    // Chrome on iOS uses Safari's WebKit engine, so it has the same limitations
    const isChromeOnIOS = isIOS && isChrome;

    // Log for debugging
    console.log('[NotificationSettings] Browser detection:', {
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
      isChromeOnIOS,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'N/A',
      hasServiceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
      hasPushManager: typeof window !== 'undefined' && 'PushManager' in window,
      hasNotification: typeof window !== 'undefined' && 'Notification' in window,
    });

    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-yellow-200 font-semibold mb-1">Not Supported</h3>
            {isIOS ? (
              <div className="text-yellow-300/80 text-sm space-y-2">
                <p>
                  {isChromeOnIOS
                    ? "Chrome on iOS uses Safari's engine and has the same limitations."
                    : "Push notifications on iOS Safari"} require iOS 16.4+ and the app to be installed as a PWA (Progressive Web App).
                </p>
                <div className="mt-3 p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                  <p className="font-semibold mb-2">To enable notifications on iOS:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Open this site in <strong>Safari</strong> (not Chrome)</li>
                    <li>Tap the Share button (box with arrow up)</li>
                    <li>Scroll down and select "Add to Home Screen"</li>
                    <li>Open the app from your Home Screen icon</li>
                    <li>Come back to Settings and enable notifications</li>
                  </ol>
                </div>
                <p className="text-xs mt-2 text-yellow-400/90 font-medium">
                  ⚠️ Important: All iOS browsers (Chrome, Firefox, etc.) use Safari's engine and require PWA installation for notifications.
                </p>
              </div>
            ) : isAndroid && isChrome ? (
              <div className="text-yellow-300/80 text-sm space-y-2">
                <p>
                  Chrome on Android should support push notifications. However, it seems your device or browser version may not support them.
                </p>
                <div className="mt-3 p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                  <p className="font-semibold mb-2">Requirements:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Android 5.0+ (Lollipop or later)</li>
                    <li>Chrome 42+ (latest version recommended)</li>
                    <li>HTTPS connection (or localhost)</li>
                    <li>Notifications enabled in Android Settings</li>
                  </ul>
                </div>
                <p className="text-xs mt-2">
                  Check browser console for detailed error information.
                </p>
              </div>
            ) : (
              <div className="text-yellow-300/80 text-sm space-y-2">
                <p>
                  Push notifications are not supported in your current browser.
                </p>
                <div className="mt-3 p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                  <p className="font-semibold mb-2">Supported browsers:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li><strong>Desktop:</strong> Chrome, Firefox, Edge, Safari 16+</li>
                    <li><strong>Android:</strong> Chrome 42+, Firefox, Samsung Internet</li>
                    <li><strong>iOS:</strong> Safari 16.4+ (as PWA only)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Permission Status Banner */}
      {permission === 'denied' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-200 font-semibold mb-2">Permission Denied</h3>
              <p className="text-red-300/80 text-sm mb-3">
                You've blocked notifications for this site. To enable notifications, you need to allow them in your browser settings.
              </p>
              <details className="text-xs text-red-300/60">
                <summary className="cursor-pointer hover:text-red-300">How to reset permissions</summary>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li><strong>Chrome:</strong> Click the lock icon in the address bar → Site settings → Reset permissions</li>
                  <li><strong>Firefox:</strong> Click the lock icon → Clear permissions and data → Confirm</li>
                  <li><strong>Safari:</strong> Safari → Settings → Websites → Notifications → Reset for this site</li>
                </ul>
              </details>
            </div>
          </div>
        </div>
      )}

      {permission === 'granted' && isSubscribed && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-green-200 font-semibold mb-1">Notifications Enabled</h3>
              <p className="text-green-300/80 text-sm">
                You'll receive push notifications when you get new anonymous messages.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Toggle */}
      <div className="bg-[#1A1A1A]/80 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
              {preferences.enabled ? (
                <Bell className="w-6 h-6 text-purple-400" />
              ) : (
                <BellOff className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                Push Notifications
              </h3>
              <p className="text-sm text-gray-400">
                Receive notifications for new anonymous messages
              </p>
            </div>
          </div>

          <button
            onClick={() => handleToggleNotifications(!preferences.enabled)}
            disabled={isSaving || permission === 'denied'}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              preferences.enabled ? 'bg-purple-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                preferences.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Content Mode Selection */}
      {preferences.enabled && isSubscribed && (
        <div className="bg-[#1A1A1A]/80 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">
            Notification Content
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Choose what to show in notifications
          </p>

          <div className="space-y-3">
            {/* Private Mode */}
            <button
              onClick={() => handleUpdatePreference('show_preview', false)}
              disabled={isSaving}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                !preferences.show_preview
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">Private Alert</h4>
                    {!preferences.show_preview && (
                      <Check className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    Show "You have a new anonymous message" without revealing content
                  </p>
                </div>
              </div>
            </button>

            {/* Preview Mode */}
            <button
              onClick={() => handleUpdatePreference('show_preview', true)}
              disabled={isSaving}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                preferences.show_preview
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">Show Preview</h4>
                    {preferences.show_preview && (
                      <Check className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    Display the first 100 characters of the message in the notification
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Test Notification Button */}
      {preferences.enabled && isSubscribed && (
        <button
          onClick={handleSendTest}
          disabled={isTesting}
          className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isTesting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending Test...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Test Notification
            </>
          )}
        </button>
      )}
    </div>
  );
}
