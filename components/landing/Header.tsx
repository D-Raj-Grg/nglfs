"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Dock, DockIcon } from "@/components/ui/dock"
import { Sparkles, HelpCircle, LogIn, UserPlus, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/ui/logo"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function Header() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Prevent hydration mismatch for theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Smooth scroll handler for anchor links
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-2 sm:px-4">
      <TooltipProvider delayDuration={200}>
        <Dock
          className={cn(
            "border-white/10 bg-[#1A1A1A]/80",
            "shadow-2xl shadow-purple-500/10",
            "max-w-fit mx-auto"
          )}
        >
          {/* Logo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <DockIcon>
                <Link
                  href="/"
                  className={cn(
                    "flex size-full items-center justify-center",
                    "transition-opacity hover:opacity-80",
                    "min-w-[44px] min-h-[44px]", // Accessibility: minimum touch target
                    "p-2"
                  )}
                  aria-label="NGLFS Home"
                >
                  <Logo variant="icon" size="sm" className="h-7 w-7 sm:h-8 sm:w-8" />
                </Link>
              </DockIcon>
            </TooltipTrigger>
            <TooltipContent>
              <p>Home</p>
            </TooltipContent>
          </Tooltip>

          {/* Separator */}
          <div className="h-6 sm:h-8 w-px bg-white/20" />

          {/* Navigation Icons - no need home icon as we have a link to the home page */}

          <Tooltip>
            <TooltipTrigger asChild>
              <DockIcon>
                <Link
                  href="#features"
                  onClick={(e) => handleSmoothScroll(e, '#features')}
                  className={cn(
                    "flex size-full items-center justify-center",
                    "text-gray-400 transition-colors hover:text-white",
                    "min-w-[44px] min-h-[44px]"
                  )}
                  aria-label="Features"
                >
                  <Sparkles className="size-4 sm:size-5" />
                </Link>
              </DockIcon>
            </TooltipTrigger>
            <TooltipContent>
              <p>Features</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <DockIcon>
                <Link
                  href="#faq"
                  onClick={(e) => handleSmoothScroll(e, '#faq')}
                  className={cn(
                    "flex size-full items-center justify-center",
                    "text-gray-400 transition-colors hover:text-white",
                    "min-w-[44px] min-h-[44px]"
                  )}
                  aria-label="FAQ"
                >
                  <HelpCircle className="size-4 sm:size-5" />
                </Link>
              </DockIcon>
            </TooltipTrigger>
            <TooltipContent>
              <p>FAQ</p>
            </TooltipContent>
          </Tooltip>

          {/* Separator */}
          <div className="h-6 sm:h-8 w-px bg-white/20" />

          {/* Theme Toggle */}
          {mounted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <DockIcon>
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className={cn(
                      "flex size-full items-center justify-center",
                      "text-gray-400 transition-colors hover:text-white",
                      "min-w-[44px] min-h-[44px]",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                    )}
                    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
                  >
                    {theme === "dark" ? (
                      <Sun className="size-4 sm:size-5" />
                    ) : (
                      <Moon className="size-4 sm:size-5" />
                    )}
                  </button>
                </DockIcon>
              </TooltipTrigger>
              <TooltipContent>
                <p>{theme === "dark" ? "Light mode" : "Dark mode"}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Separator */}
          <div className="h-6 sm:h-8 w-px bg-white/20" />

          {/* Auth Icons */}
          <Tooltip>
            <TooltipTrigger asChild>
              <DockIcon>
                <Link
                  href="/login"
                  className={cn(
                    "flex size-full items-center justify-center",
                    "text-gray-400 transition-colors hover:text-white",
                    "min-w-[44px] min-h-[44px]"
                  )}
                  aria-label="Log in"
                >
                  <LogIn className="size-4 sm:size-5" />
                </Link>
              </DockIcon>
            </TooltipTrigger>
            <TooltipContent>
              <p>Log in</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <DockIcon>
                <Link
                  href="/signup"
                  className={cn(
                    "flex size-full items-center justify-center",
                    "rounded-full bg-linear-to-r from-[#8B5CF6] to-[#EC4899]",
                    "text-white transition-transform hover:scale-110",
                    "min-w-[44px] min-h-[44px]",
                    // Subtle pulse animation to draw attention
                    "relative",
                    "before:absolute before:inset-0 before:rounded-full",
                    "before:bg-linear-to-r before:from-[#8B5CF6] before:to-[#EC4899]",
                    "before:opacity-0 hover:before:opacity-30",
                    "before:transition-opacity before:duration-300"
                  )}
                  aria-label="Sign up"
                >
                  <UserPlus className="size-4 sm:size-5 relative z-10" />
                </Link>
              </DockIcon>
            </TooltipTrigger>
            <TooltipContent>
              <p>Get Started</p>
            </TooltipContent>
          </Tooltip>
        </Dock>
      </TooltipProvider>
    </header>
  )
}
