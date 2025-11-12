"use client";

/**
 * Skip to Main Content Link
 * Accessibility feature for keyboard navigation
 * Appears when focused via Tab key
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:rounded-lg focus:bg-linear-to-r focus:from-purple-600 focus:to-pink-600 focus:text-white focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/20"
    >
      Skip to main content
    </a>
  );
}
