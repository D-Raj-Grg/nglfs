import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  variant?: "full" | "icon"
  size?: "sm" | "md" | "lg" | "xl"
}

export function Logo({ className, variant = "full", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
    xl: "h-12",
  }

  if (variant === "icon") {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(sizeClasses[size], "w-auto", className)}
        aria-label="NGLFS Logo"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle with glassmorphism effect */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="url(#logo-gradient)"
          opacity="0.1"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#logo-gradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />

        {/* Stylized "N" letterform */}
        <path
          d="M 30 65 L 30 35 L 35 35 L 35 55 L 55 35 L 60 35 L 60 65 L 55 65 L 55 45 L 35 65 Z"
          fill="url(#logo-gradient)"
          filter="url(#glow)"
        />

        {/* Message bubble accent */}
        <circle
          cx="70"
          cy="30"
          r="8"
          fill="url(#logo-gradient)"
          opacity="0.6"
        />
        <circle
          cx="70"
          cy="30"
          r="4"
          fill="#EC4899"
        />
      </svg>
    )
  }

  // Full logo with text
  return (
    <svg
      viewBox="0 0 200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizeClasses[size], "w-auto", className)}
      aria-label="NGLFS"
    >
      <defs>
        <linearGradient id="logo-gradient-full" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <filter id="glow-full">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Icon part */}
      <g transform="translate(5, 10)">
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="url(#logo-gradient-full)"
          opacity="0.1"
        />
        <circle
          cx="20"
          cy="20"
          r="18"
          stroke="url(#logo-gradient-full)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.3"
        />
        <path
          d="M 12 28 L 12 12 L 14 12 L 14 24 L 24 12 L 26 12 L 26 28 L 24 28 L 24 16 L 14 28 Z"
          fill="url(#logo-gradient-full)"
          filter="url(#glow-full)"
        />
        <circle cx="30" cy="12" r="3" fill="url(#logo-gradient-full)" opacity="0.6" />
        <circle cx="30" cy="12" r="1.5" fill="#EC4899" />
      </g>

      {/* Text "NGLFS" */}
      <g transform="translate(55, 30)">
        <text
          x="0"
          y="0"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="24"
          fontWeight="700"
          fill="url(#logo-gradient-full)"
          filter="url(#glow-full)"
        >
          NGLFS
        </text>
      </g>
    </svg>
  )
}

export function LogoMark() {
  return <Logo variant="icon" />
}

export function LogoFull() {
  return <Logo variant="full" />
}
