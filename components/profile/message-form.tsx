"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShinyButton } from "@/components/ui/shiny-button";
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
          <div className="mx-auto w-20 h-20 bg-linear-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Message Sent! 🎉
            </h3>
            <p className="text-gray-400">
              Your anonymous message has been delivered.
            </p>
          </div>
        </div>

        {/* Send Another Button */}
        <Button
          onClick={() => setShowSuccess(false)}
          className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          Send Another Message
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
          placeholder="Type your anonymous message here... Be kind!"
          className="min-h-[150px] resize-none text-base"
          maxLength={MAX_LENGTH}
          disabled={isSubmitting}
        />

        {/* Character Counter */}
        <div className="flex justify-between items-center text-sm">
          <span
            className={cn(
              "transition-colors",
              remainingChars < 50
                ? "text-yellow-500"
                : remainingChars === 0
                ? "text-red-500"
                : "text-gray-500"
            )}
          >
            {remainingChars} characters remaining
          </span>
          <span className="text-gray-500">
            {message.length}/{MAX_LENGTH}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <ShinyButton
        type="submit"
        disabled={isSubmitting || !message.trim()}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Send Anonymously
          </>
        )}
      </ShinyButton>

      {/* Privacy Notice */}
      <p className="text-xs text-center text-gray-500">
        Your message is completely anonymous. The recipient will never know who sent it.
      </p>
    </form>
  );
}
