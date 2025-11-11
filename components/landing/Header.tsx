"use client"

import Link from "next/link"
import { Dock, DockIcon } from "@/components/ui/dock"
import { Home, Sparkles, HelpCircle, LogIn, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Header() {
  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4">
      <Dock
        iconSize={48}
        iconMagnification={64}
        className={cn(
          "border-white/10 bg-[#1A1A1A]/80",
          "shadow-2xl shadow-purple-500/10"
        )}
      >
        {/* Logo */}
        <DockIcon>
          <Link
            href="/"
            className={cn(
              "flex size-full items-center justify-center",
              "text-xl font-bold",
              "bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]",
              "bg-clip-text text-transparent",
              "transition-opacity hover:opacity-80"
            )}
            aria-label="Home"
          >
            N
          </Link>
        </DockIcon>

        {/* Separator */}
        <div className="h-8 w-px bg-white/20" />

        {/* Navigation Icons */}
        <DockIcon>
          <Link
            href="/"
            className={cn(
              "flex size-full items-center justify-center",
              "text-gray-400 transition-colors hover:text-white"
            )}
            aria-label="Home"
          >
            <Home className="size-5" />
          </Link>
        </DockIcon>

        <DockIcon>
          <Link
            href="#features"
            className={cn(
              "flex size-full items-center justify-center",
              "text-gray-400 transition-colors hover:text-white"
            )}
            aria-label="Features"
          >
            <Sparkles className="size-5" />
          </Link>
        </DockIcon>

        <DockIcon>
          <Link
            href="#faq"
            className={cn(
              "flex size-full items-center justify-center",
              "text-gray-400 transition-colors hover:text-white"
            )}
            aria-label="FAQ"
          >
            <HelpCircle className="size-5" />
          </Link>
        </DockIcon>

        {/* Separator */}
        <div className="h-8 w-px bg-white/20" />

        {/* Auth Icons */}
        <DockIcon>
          <Link
            href="/login"
            className={cn(
              "flex size-full items-center justify-center",
              "text-gray-400 transition-colors hover:text-white"
            )}
            aria-label="Log in"
          >
            <LogIn className="size-5" />
          </Link>
        </DockIcon>

        <DockIcon>
          <Link
            href="/signup"
            className={cn(
              "flex size-full items-center justify-center",
              "rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]",
              "text-white transition-transform hover:scale-110"
            )}
            aria-label="Sign up"
          >
            <UserPlus className="size-5" />
          </Link>
        </DockIcon>
      </Dock>
    </header>
  )
}
