import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { SkipToContent } from "@/components/ui/skip-to-content";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://nglfs.com'),
  title: {
    default: "NGLFS - Anonymous Messaging Made Beautiful",
    template: "%s | NGLFS"
  },
  description: "Create your unique profile link and share it with friends. Receive honest, anonymous feedback in a beautiful, privacy-first platform. No signup required to send messages.",
  keywords: ["anonymous messaging", "feedback", "privacy", "NGLFS", "anonymous questions", "honest feedback", "secret messages"],
  authors: [{ name: "NGLFS Team" }],
  creator: "NGLFS",
  publisher: "NGLFS",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "NGLFS",
    title: "NGLFS - Anonymous Messaging Made Beautiful",
    description: "Create your unique profile link and share it with friends. Receive honest, anonymous feedback in a beautiful, privacy-first platform.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NGLFS - Anonymous Messaging Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NGLFS - Anonymous Messaging Made Beautiful",
    description: "Create your unique profile link and share it with friends. Receive honest, anonymous feedback.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/favicon.svg", color: "#8B5CF6" },
    ],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SkipToContent />
          <AuthProvider>
            {children}
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
