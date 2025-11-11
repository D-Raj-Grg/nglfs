"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Label className="text-white">Theme Preference</Label>
        <div className="grid grid-cols-3 gap-4">
          <div className="aspect-square rounded-lg border-2 border-gray-700 bg-gray-800/50 animate-pulse" />
          <div className="aspect-square rounded-lg border-2 border-gray-700 bg-gray-800/50 animate-pulse" />
          <div className="aspect-square rounded-lg border-2 border-gray-700 bg-gray-800/50 animate-pulse" />
        </div>
      </div>
    );
  }

  const themes = [
    {
      value: "light",
      label: "Light",
      icon: Sun,
      description: "Light theme",
    },
    {
      value: "dark",
      label: "Dark",
      icon: Moon,
      description: "Dark theme",
    },
    {
      value: "system",
      label: "System",
      icon: Monitor,
      description: "Follow system preference",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-white text-lg">Theme Preference</Label>
        <p className="text-sm text-gray-400 mt-1">
          Choose how NGLFS looks to you
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isActive = theme === themeOption.value;

          return (
            <button
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`
                relative aspect-square rounded-xl border-2 transition-all
                ${
                  isActive
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }
              `}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                <Icon
                  className={`w-8 h-8 ${
                    isActive ? "text-purple-500" : "text-gray-400"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                >
                  {themeOption.label}
                </span>
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500 ring-2 ring-purple-500/20" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Current theme info */}
      <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
        <p className="text-sm text-gray-400">
          Current theme: <span className="text-white font-medium capitalize">{theme}</span>
        </p>
      </div>
    </div>
  );
}
