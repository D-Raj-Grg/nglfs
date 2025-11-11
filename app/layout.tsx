import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
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
  title: "NGLFS - Anonymous Messaging Made Beautiful",
  description: "Create your unique profile link and share it with friends. Receive honest, anonymous feedback in a beautiful, privacy-first platform.",
  keywords: ["anonymous messaging", "feedback", "privacy", "NGLFS", "anonymous questions"],
  authors: [{ name: "NGLFS Team" }],
  openGraph: {
    title: "NGLFS - Anonymous Messaging Made Beautiful",
    description: "Create your unique profile link and share it with friends. Receive honest, anonymous feedback in a beautiful, privacy-first platform.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NGLFS - Anonymous Messaging Made Beautiful",
    description: "Create your unique profile link and share it with friends.",
  },
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
          <AuthProvider>
            {children}
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
