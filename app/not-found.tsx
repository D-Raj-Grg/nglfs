"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { Particles } from "@/components/ui/particles";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0A]">
      {/* Animated Particles Background */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={50}
        ease={80}
        color="#8B5CF6"
        refresh={false}
      />

      {/* 404 Content */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-32 text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-linear-to-r from-[#8B5CF6] via-[#EC4899] to-[#8B5CF6] bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Message */}
        <AnimatedGradientText className="text-2xl font-semibold mb-4">
          Page Not Found
        </AnimatedGradientText>

        <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist. It might have been
          moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button
              size="lg"
              className="gap-2 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>

          <Button
            size="lg"
            variant="outline"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>

        {/* Help text */}
        <div className="mt-12 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Search className="w-5 h-5 text-purple-500" />
            <p className="text-sm font-medium text-white">Looking for something specific?</p>
          </div>
          <p className="text-sm text-gray-400">
            Try searching from the{" "}
            <Link href="/" className="text-purple-500 hover:text-purple-400 underline">
              homepage
            </Link>{" "}
            or check out the{" "}
            <Link href="/login" className="text-purple-500 hover:text-purple-400 underline">
              login page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
