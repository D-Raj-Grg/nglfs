"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InteractiveHoverProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

/**
 * Adds interactive hover effects with smooth scaling
 * Perfect for cards, buttons, and interactive elements
 */
export function InteractiveHover({
  children,
  className,
  scale = 1.02,
}: InteractiveHoverProps) {
  return (
    <div
      className={cn(
        "transition-all duration-200 ease-out",
        "hover:will-change-transform",
        className
      )}
      style={{
        ["--scale" as string]: scale,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `scale(var(--scale))`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {children}
    </div>
  );
}

/**
 * Adds lift effect on hover - perfect for cards
 */
export function LiftOnHover({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "transition-all duration-200 ease-out",
        "hover:will-change-transform",
        "hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Adds glow effect on hover
 */
export function GlowOnHover({
  children,
  className,
  color = "purple",
}: {
  children: ReactNode;
  className?: string;
  color?: "purple" | "pink" | "blue";
}) {
  const glowColors = {
    purple: "hover:shadow-purple-500/50",
    pink: "hover:shadow-pink-500/50",
    blue: "hover:shadow-blue-500/50",
  };

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out",
        "hover:will-change-transform",
        `hover:shadow-lg ${glowColors[color]}`,
        className
      )}
    >
      {children}
    </div>
  );
}
