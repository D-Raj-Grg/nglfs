/**
 * Design System Constants for NGLFS
 * Ensures consistency across all pages and components
 */

// Spacing Scale (based on Tailwind)
export const spacing = {
  // Container padding
  containerPadding: 'px-4 sm:px-6 lg:px-8',

  // Section spacing
  sectionPadding: 'py-12 sm:py-16 lg:py-24',
  sectionGap: 'space-y-12 sm:space-y-16 lg:space-y-24',

  // Component spacing
  cardPadding: 'p-6 sm:p-8',
  cardGap: 'space-y-4 sm:space-y-6',

  // Form spacing
  formGap: 'space-y-4',
  inputGap: 'space-y-2',

  // Grid gaps
  gridGapSm: 'gap-4',
  gridGapMd: 'gap-6',
  gridGapLg: 'gap-8',
} as const;

// Typography Scale
export const typography = {
  // Headings
  h1: 'text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight',
  h2: 'text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight',
  h3: 'text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight',
  h4: 'text-xl sm:text-2xl font-semibold tracking-tight',
  h5: 'text-lg sm:text-xl font-semibold',
  h6: 'text-base sm:text-lg font-semibold',

  // Body text
  body: 'text-base',
  bodyLarge: 'text-lg',
  bodySmall: 'text-sm',
  caption: 'text-xs',

  // Special
  lead: 'text-lg sm:text-xl text-muted-foreground',
  quote: 'text-lg italic border-l-4 pl-4',
} as const;

// Colors (using CSS variables)
export const colors = {
  // Gradients
  gradientPrimary: 'bg-gradient-to-r from-[rgb(var(--gradient-primary-from))] to-[rgb(var(--gradient-primary-to))]',
  gradientSecondary: 'bg-gradient-to-r from-[rgb(var(--gradient-secondary-from))] to-[rgb(var(--gradient-secondary-to))]',

  // Gradient text
  gradientTextPrimary: 'bg-gradient-to-r from-[rgb(var(--gradient-primary-from))] to-[rgb(var(--gradient-primary-to))] bg-clip-text text-transparent',
  gradientTextSecondary: 'bg-gradient-to-r from-[rgb(var(--gradient-secondary-from))] to-[rgb(var(--gradient-secondary-to))] bg-clip-text text-transparent',

  // Status colors
  success: 'text-[rgb(var(--success))]',
  warning: 'text-[rgb(var(--warning))]',
  danger: 'text-[rgb(var(--danger))]',

  // Backgrounds
  bgSuccess: 'bg-[rgb(var(--success))]/10',
  bgWarning: 'bg-[rgb(var(--warning))]/10',
  bgDanger: 'bg-[rgb(var(--danger))]/10',
} as const;

// Border Radius
export const borderRadius = {
  card: 'rounded-2xl',
  button: 'rounded-xl',
  input: 'rounded-lg',
  badge: 'rounded-full',
  image: 'rounded-lg',
} as const;

// Shadows
export const shadows = {
  card: 'shadow-xl',
  cardHover: 'hover:shadow-2xl',
  button: 'shadow-lg',
  subtle: 'shadow-sm',
} as const;

// Glassmorphism
export const glass = {
  light: 'backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10',
  strong: 'backdrop-blur-2xl bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/15',
  card: 'backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl shadow-xl',
} as const;

// Transitions
export const transitions = {
  default: 'transition-all duration-200 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
  fast: 'transition-all duration-150 ease-in-out',
  colors: 'transition-colors duration-200',
} as const;

// Component-specific patterns
export const components = {
  // Buttons
  button: {
    base: 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
    sizes: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl',
    },
  },

  // Cards
  card: {
    base: 'backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl shadow-xl',
    hover: 'hover:shadow-2xl hover:scale-[1.02] transition-all duration-200',
    padding: 'p-6 sm:p-8',
  },

  // Input fields
  input: {
    base: 'w-full rounded-lg border bg-background px-4 py-2 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
    error: 'border-destructive focus:border-destructive focus:ring-destructive/20',
  },
} as const;

// Icon sizes (for Lucide React)
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
} as const;

// Animation durations
export const animations = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 500,
} as const;

// Helper function to combine classes
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
