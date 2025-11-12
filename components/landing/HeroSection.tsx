"use client"

import Link from "next/link"
import { Particles } from "@/components/ui/particles"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { BlurFade } from "@/components/ui/blur-fade"
import { ArrowRight } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0A]">
      {/* Animated Particles Background */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={100}
        ease={80}
        color="#8B5CF6"
        refresh={false}
      />

      {/* Hero Content */}
      <div className="container relative z-10 mx-auto px-4 py-32 pt-40 text-center">
        <BlurFade delay={0.1}>
          <div className="mb-6 flex justify-center">
            <AnimatedGradientText className="text-base">
              <span className="bg-linear-to-r from-[#8B5CF6] via-[#EC4899] to-[#8B5CF6] bg-clip-text text-transparent">
                Anonymous Messaging Made Beautiful
              </span>
            </AnimatedGradientText>
          </div>
        </BlurFade>

        <BlurFade delay={0.2}>
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
            Get Anonymous Messages{" "}
            <span className="bg-linear-to-r from-[#8B5CF6] via-[#EC4899] to-[#8B5CF6] bg-clip-text text-transparent">
              from Friends
            </span>
          </h1>
        </BlurFade>

        <BlurFade delay={0.3}>
          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-gray-400 md:text-xl">
            Create your unique profile link and share it with friends. Receive
            honest, anonymous feedback in a beautiful, privacy-first platform.
            No signup required to send messages.
          </p>
        </BlurFade>

        <BlurFade delay={0.4}>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <RainbowButton className="px-8 py-6 text-lg font-semibold">
                Get Started Free
                <ArrowRight className="ml-2 inline-block size-5 transition-transform group-hover:translate-x-1" />
              </RainbowButton>
            </Link>
            <Link
              href="#features"
              className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-6 text-lg font-medium text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </BlurFade>

        <BlurFade delay={0.5}>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-[#8B5CF6]" />
              <span>100% Anonymous</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-[#EC4899]" />
              <span>No Ads</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-[#8B5CF6]" />
              <span>Privacy First</span>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
