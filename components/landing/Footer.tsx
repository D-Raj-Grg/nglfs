"use client"

import Link from "next/link"
import { Github, Twitter, Mail, Heart } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t border-white/10 bg-[#0A0A0A] py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="mb-4 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-2xl font-bold text-transparent">
              NGLFS
            </h3>
            <p className="mb-4 max-w-md text-gray-400">
              The most beautiful way to receive anonymous messages. Privacy-first,
              ad-free, and built for authentic connections.
            </p>
            <div className="flex gap-4">
              <a
                href="https://twitter.com/nglfs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-all hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6]"
                aria-label="Twitter"
              >
                <Twitter className="size-5" />
              </a>
              <a
                href="https://github.com/nglfs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-all hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6]"
                aria-label="GitHub"
              >
                <Github className="size-5" />
              </a>
              <a
                href="mailto:hello@nglfs.com"
                className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-all hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6]"
                aria-label="Email"
              >
                <Mail className="size-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Product</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link
                  href="/features"
                  className="transition-colors hover:text-[#8B5CF6]"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="transition-colors hover:text-[#8B5CF6]"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="transition-colors hover:text-[#8B5CF6]"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/roadmap"
                  className="transition-colors hover:text-[#8B5CF6]"
                >
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Legal</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-[#8B5CF6]"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="transition-colors hover:text-[#8B5CF6]"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="transition-colors hover:text-[#8B5CF6]"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/guidelines"
                  className="transition-colors hover:text-[#8B5CF6]"
                >
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-gray-400 md:flex-row">
          <p>
            &copy; {currentYear} NGLFS. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            Made with <Heart className="size-4 fill-[#EC4899] text-[#EC4899]" />{" "}
            for authentic connections
          </p>
        </div>
      </div>
    </footer>
  )
}
