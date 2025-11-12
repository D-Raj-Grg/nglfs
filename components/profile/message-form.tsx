"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { collectClientTrackingData } from "@/components/tracking/client-tracker";

interface MessageFormProps {
  recipientUsername: string;
}

export function MessageForm({ recipientUsername }: MessageFormProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const MAX_LENGTH = 500;
  const remainingChars = MAX_LENGTH - message.length;

  /**
   * Handle message submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate message
    if (!message.trim()) {
      toast.error("Please write a message");
      return;
    }

    if (message.length > MAX_LENGTH) {
      toast.error(`Message is too long (max ${MAX_LENGTH} characters)`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Collect comprehensive client-side tracking data
      const clientTracking = collectClientTrackingData();

      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient_username: recipientUsername,
          content: message.trim(),
          // Include full client tracking data for comprehensive analytics
          clientData: {
            timezone: clientTracking.timezone,
            language: clientTracking.language,
            screenResolution: clientTracking.screenResolution,
            viewportSize: clientTracking.viewportSize,
            availableScreen: clientTracking.availableScreen,
            colorDepth: clientTracking.colorDepth,
            pixelRatio: clientTracking.pixelRatio,
            touchSupport: clientTracking.touchSupport,
            connectionType: clientTracking.connectionType,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          toast.error(
            data.error || "You've sent too many messages. Please try again later."
          );
          return;
        }

        toast.error(data.error || "Failed to send message");
        return;
      }

      // Success!
      setShowSuccess(true);
      setMessage("");
      toast.success("Message sent anonymously! 🎉");

      // Reset success state after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="space-y-6 py-8">
        {/* Success Message */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div>
            <h3 className="text-xl font-bold text-black mb-2">
              message sent! 🎉
            </h3>
            <p className="text-gray-600 text-sm">
              your anonymous message has been delivered.
            </p>
          </div>
        </div>

        {/* Send Another Button */}
        <Button
          onClick={() => setShowSuccess(false)}
          className="w-full bg-black text-white rounded-full py-4 text-lg font-bold hover:bg-gray-900 transition-colors"
        >
          send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Message Textarea */}
      <div className="space-y-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="type your anonymous message here..."
          className="min-h-[120px] resize-none text-base border-gray-300 focus:border-black focus:ring-black"
          maxLength={MAX_LENGTH}
          disabled={isSubmitting}
        />

        {/* Character Counter */}
        <div className="flex justify-end items-center text-xs">
          <span
            className={cn(
              "transition-colors",
              remainingChars < 50
                ? "text-orange-500"
                : remainingChars === 0
                ? "text-red-500"
                : "text-gray-500"
            )}
          >
            {message.length}/{MAX_LENGTH}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting || !message.trim()}
        className="w-full bg-black text-white rounded-full py-4 text-lg font-bold hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            sending...
          </>
        ) : (
          "send!"
        )}
      </Button>

      {/* Privacy Notice */}
      <p className="text-xs text-center text-gray-600">
        your message is completely anonymous. the recipient will never know who sent it.
      </p>
    </form>
  );
}
