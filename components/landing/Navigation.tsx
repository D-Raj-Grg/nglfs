"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] blur-sm opacity-75" />
              <div className="relative rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-3 py-1.5">
                <span className="text-lg font-bold text-white">NGLFS</span>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Pricing
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                className="text-sm font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:opacity-90 transition-opacity"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
