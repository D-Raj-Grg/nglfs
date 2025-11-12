/**
 * Notification Permission Prompt Dialog
 *
 * Beautiful glassmorphic dialog to request notification permissions
 * Shows benefits and has "Enable" / "Maybe Later" options
 */

'use client';

import { useState } from 'react';
import { Bell, X, Check } from 'lucide-react';
import {
  enableNotifications,
  incrementDismissalCount,
  shouldShowPrompt,
} from '@/lib/notifications/client';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/notifications/constants';

interface NotificationPromptProps {
  /** Whether the prompt is visible */
  isOpen: boolean;

  /** Callback when prompt is closed */
  onClose: () => void;

  /** Callback when notifications are successfully enabled */
  onSuccess?: () => void;
}

/**
 * Notification Permission Prompt Component
 *
 * Usage:
 * ```tsx
 * const [showPrompt, setShowPrompt] = useState(false);
 *
 * <NotificationPrompt
 *   isOpen={showPrompt}
 *   onClose={() => setShowPrompt(false)}
 *   onSuccess={() => console.log('Enabled!')}
 * />
 * ```
 */
export function NotificationPrompt({ isOpen, onClose, onSuccess }: NotificationPromptProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleEnable = async () => {
    setIsLoading(true);

    try {
      // Enable notifications
      await enableNotifications();

      // Show success message
      toast.success(SUCCESS_MESSAGES.SUBSCRIPTION_CREATED, {
        description: "You'll receive notifications for new messages",
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close prompt
      onClose();
    } catch (error: any) {
      console.error('[NotificationPrompt] Failed to enable notifications:', error);

      // Show error message
      const errorMessage = error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
      toast.error('Failed to enable notifications', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaybeLater = () => {
    // Track dismissal
    incrementDismissalCount();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Dialog */}
      <div className="relative w-full max-w-md bg-[#1A1A1A]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleMaybeLater}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
              <Bell className="w-10 h-10 text-purple-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            Stay Updated
          </h2>

          {/* Description */}
          <p className="text-gray-300 text-center mb-6">
            Get instant notifications when you receive new anonymous messages. Never miss a message!
          </p>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-green-500/20 rounded-full shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-200 font-medium">Real-time alerts</p>
                <p className="text-xs text-gray-400">
                  Know immediately when someone sends you a message
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 bg-green-500/20 rounded-full shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-200 font-medium">Privacy control</p>
                <p className="text-xs text-gray-400">
                  Choose to show message previews or keep them private
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 bg-green-500/20 rounded-full shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-200 font-medium">Always in control</p>
                <p className="text-xs text-gray-400">
                  Disable notifications anytime from settings
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleEnable}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Enabling...
                </span>
              ) : (
                'Enable Notifications'
              )}
            </button>

            <button
              onClick={handleMaybeLater}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Maybe Later
            </button>
          </div>

          {/* Footer note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            We respect your privacy. You can change your notification preferences anytime in settings.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage notification prompt visibility
 */
export function useNotificationPrompt() {
  const [isOpen, setIsOpen] = useState(false);

  const show = () => {
    // Check if we should show the prompt
    if (shouldShowPrompt()) {
      setIsOpen(true);
    }
  };

  const hide = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    show,
    hide,
  };
}
