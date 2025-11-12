"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { Particles } from "@/components/ui/particles";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0A]">
      {/* Animated Particles Background */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={50}
        ease={80}
        color="#EC4899"
        refresh={false}
      />

      {/* Error Content */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-32 text-center">
        {/* Error Icon */}
        <div className="mb-8 flex justify-center">
          <div className="p-6 rounded-full bg-red-500/10 border-2 border-red-500/20">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
        </div>

        {/* Message */}
        <AnimatedGradientText className="text-2xl font-semibold mb-4">
          Something Went Wrong
        </AnimatedGradientText>

        <p className="text-lg text-gray-400 mb-2 max-w-md mx-auto">
          We encountered an unexpected error. Don't worry, our team has been notified.
        </p>

        {/* Error details (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-8 p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-left max-w-xl mx-auto">
            <p className="text-sm font-mono text-red-400 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Button
            size="lg"
            onClick={reset}
            className="gap-2 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </div>

        {/* Help text */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <p className="text-sm font-medium text-white mb-2">
            If this problem persists
          </p>
          <p className="text-sm text-gray-400">
            Please try refreshing the page or contact support if the issue continues.
          </p>
        </div>
      </div>
    </div>
  );
}
