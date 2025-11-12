"use client"

import { Logo } from "@/components/ui/logo"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"

export default function LogoDemo() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Theme Toggle */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
            NGLFS Logo Demo
          </h1>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-3 rounded-full bg-[#1A1A1A] border border-white/10 hover:bg-[#2A2A2A] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-gray-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Icon Variants */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Icon Variants</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-[#1A1A1A]/50 border border-white/10">
              <Logo variant="icon" size="sm" />
              <p className="text-sm text-gray-400">Small</p>
            </div>
            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-[#1A1A1A]/50 border border-white/10">
              <Logo variant="icon" size="md" />
              <p className="text-sm text-gray-400">Medium</p>
            </div>
            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-[#1A1A1A]/50 border border-white/10">
              <Logo variant="icon" size="lg" />
              <p className="text-sm text-gray-400">Large</p>
            </div>
            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-[#1A1A1A]/50 border border-white/10">
              <Logo variant="icon" size="xl" />
              <p className="text-sm text-gray-400">Extra Large</p>
            </div>
          </div>
        </section>

        {/* Full Logo Variants */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Full Logo Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-[#1A1A1A]/50 border border-white/10">
              <Logo variant="full" size="sm" />
              <p className="text-sm text-gray-400">Small</p>
            </div>
            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-[#1A1A1A]/50 border border-white/10">
              <Logo variant="full" size="md" />
              <p className="text-sm text-gray-400">Medium</p>
            </div>
            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-[#1A1A1A]/50 border border-white/10">
              <Logo variant="full" size="lg" />
              <p className="text-sm text-gray-400">Large</p>
            </div>
            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-[#1A1A1A]/50 border border-white/10">
              <Logo variant="full" size="xl" />
              <p className="text-sm text-gray-400">Extra Large</p>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Usage Examples</h2>

          {/* Header Example */}
          <div className="p-6 rounded-2xl bg-[#1A1A1A]/50 border border-white/10">
            <h3 className="text-lg font-medium mb-4 text-foreground">Header Usage</h3>
            <div className="flex items-center gap-4 p-4 bg-[#0A0A0A] rounded-lg border border-white/5">
              <Logo variant="icon" size="md" />
              <span className="text-xl font-semibold text-foreground">NGLFS</span>
            </div>
          </div>

          {/* Card Example */}
          <div className="p-6 rounded-2xl bg-[#1A1A1A]/50 border border-white/10">
            <h3 className="text-lg font-medium mb-4 text-foreground">Card Usage</h3>
            <div className="flex flex-col items-center gap-4 p-8 bg-[#0A0A0A] rounded-2xl border border-white/5">
              <Logo variant="icon" size="xl" />
              <h4 className="text-2xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
                Welcome to NGLFS
              </h4>
              <p className="text-gray-400 text-center">
                Anonymous messaging made beautiful
              </p>
            </div>
          </div>

          {/* Loading State */}
          <div className="p-6 rounded-2xl bg-[#1A1A1A]/50 border border-white/10">
            <h3 className="text-lg font-medium mb-4 text-foreground">Loading State</h3>
            <div className="flex items-center justify-center gap-3 p-8 bg-[#0A0A0A] rounded-lg border border-white/5">
              <Logo variant="icon" size="md" className="animate-pulse" />
              <span className="text-gray-400">Loading...</span>
            </div>
          </div>
        </section>

        {/* Color Information */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Brand Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 rounded-xl bg-[#8B5CF6] border border-white/10"></div>
              <p className="text-sm text-gray-400">#8B5CF6</p>
              <p className="text-xs text-gray-500">Primary Purple</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-xl bg-[#EC4899] border border-white/10"></div>
              <p className="text-sm text-gray-400">#EC4899</p>
              <p className="text-xs text-gray-500">Primary Pink</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-xl bg-[#0A0A0A] border border-white/10"></div>
              <p className="text-sm text-gray-400">#0A0A0A</p>
              <p className="text-xs text-gray-500">Background</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-xl bg-[#1A1A1A] border border-white/10"></div>
              <p className="text-sm text-gray-400">#1A1A1A</p>
              <p className="text-xs text-gray-500">Surface</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
