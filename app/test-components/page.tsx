"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MagicCard } from "@/components/ui/magic-card"
import { Particles } from "@/components/ui/particles"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { ShinyButton } from "@/components/ui/shiny-button"
import { PulsatingButton } from "@/components/ui/pulsating-button"
import { BlurFade } from "@/components/ui/blur-fade"
import { TextAnimate } from "@/components/ui/text-animate"
import { Confetti } from "@/components/ui/confetti"

export default function TestComponentsPage() {
  const [showConfetti, setShowConfetti] = useState(false)

  return (
    <div className="relative min-h-screen bg-background">
      {/* Particles Background */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={100}
        color="#8B5CF6"
      />

      {/* Confetti */}
      {showConfetti && <Confetti particleCount={100} />}

      <div className="relative z-10 container mx-auto px-4 py-16 space-y-16">
        {/* Header */}
        <BlurFade delay={0.2}>
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold gradient-text-primary">
              NGLFS Component Showcase
            </h1>
            <TextAnimate
              text="Testing all Magic UI components and custom styling"
              className="text-xl text-muted-foreground justify-center"
              by="word"
            />
          </div>
        </BlurFade>

        {/* Animated Gradient Text */}
        <BlurFade delay={0.3}>
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Animated Gradient Text</h2>
            <AnimatedGradientText>
              <span className="gradient-text-primary font-semibold">
                Get Anonymous Messages
              </span>
            </AnimatedGradientText>
          </section>
        </BlurFade>

        {/* Buttons Grid */}
        <BlurFade delay={0.4}>
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Buttons</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-3">Shadcn Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="gradient">Gradient</Button>
                  <Button variant="gradient-secondary">
                    Gradient Secondary
                  </Button>
                  <Button variant="glass">Glass</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Magic UI Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <RainbowButton>Rainbow Button</RainbowButton>
                  <ShimmerButton>Shimmer Button</ShimmerButton>
                  <ShinyButton>Shiny Button</ShinyButton>
                  <PulsatingButton>Pulsating Button</PulsatingButton>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Button Sizes</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm" variant="gradient">
                    Small
                  </Button>
                  <Button size="default" variant="gradient">
                    Default
                  </Button>
                  <Button size="lg" variant="gradient">
                    Large
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </BlurFade>

        {/* Magic Cards */}
        <BlurFade delay={0.5}>
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Magic Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MagicCard
                gradientColor="#8B5CF6"
                className="p-6 space-y-2"
              >
                <h3 className="text-xl font-bold">Purple Gradient</h3>
                <p className="text-muted-foreground">
                  Hover to see the magic spotlight effect with purple gradient.
                </p>
              </MagicCard>

              <MagicCard
                gradientColor="#EC4899"
                className="p-6 space-y-2"
              >
                <h3 className="text-xl font-bold">Pink Gradient</h3>
                <p className="text-muted-foreground">
                  This card uses a pink gradient for the spotlight effect.
                </p>
              </MagicCard>

              <MagicCard
                gradientColor="#06B6D4"
                className="p-6 space-y-2"
              >
                <h3 className="text-xl font-bold">Cyan Gradient</h3>
                <p className="text-muted-foreground">
                  Cyan gradient creates a cool, vibrant effect.
                </p>
              </MagicCard>
            </div>
          </section>
        </BlurFade>

        {/* Glassmorphism */}
        <BlurFade delay={0.6}>
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Glassmorphism</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass p-6 space-y-2">
                <h3 className="text-xl font-bold">Glass Effect</h3>
                <p className="text-muted-foreground">
                  Basic glassmorphism with backdrop blur.
                </p>
              </div>

              <div className="glass-card p-6 space-y-2">
                <h3 className="text-xl font-bold">Glass Card</h3>
                <p className="text-muted-foreground">
                  Enhanced glass card with rounded corners and shadow.
                </p>
              </div>

              <div className="glass-strong p-6 space-y-2">
                <h3 className="text-xl font-bold">Strong Glass</h3>
                <p className="text-muted-foreground">
                  Stronger opacity for more prominent glass effect.
                </p>
              </div>
            </div>
          </section>
        </BlurFade>

        {/* Gradients */}
        <BlurFade delay={0.7}>
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Gradient Utilities</h2>
            <div className="space-y-4">
              <div className="gradient-primary p-6 rounded-2xl text-white">
                <h3 className="text-xl font-bold">Primary Gradient</h3>
                <p className="opacity-90">Purple to Pink gradient background</p>
              </div>

              <div className="gradient-secondary p-6 rounded-2xl text-white">
                <h3 className="text-xl font-bold">Secondary Gradient</h3>
                <p className="opacity-90">Blue to Cyan gradient background</p>
              </div>

              <div className="p-6 bg-background rounded-2xl border">
                <h3 className="text-4xl font-bold gradient-text-primary">
                  Gradient Text Primary
                </h3>
                <h3 className="text-4xl font-bold gradient-text-secondary mt-4">
                  Gradient Text Secondary
                </h3>
              </div>
            </div>
          </section>
        </BlurFade>

        {/* Confetti Trigger */}
        <BlurFade delay={0.8}>
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Confetti Effect</h2>
            <div className="flex gap-4">
              <Button
                variant="gradient"
                size="lg"
                onClick={() => setShowConfetti(true)}
              >
                Show Confetti
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowConfetti(false)}
              >
                Hide Confetti
              </Button>
            </div>
          </section>
        </BlurFade>

        {/* Footer */}
        <BlurFade delay={0.9}>
          <div className="text-center pt-8 pb-4">
            <p className="text-muted-foreground">
              All components are working correctly! Ready for NGLFS development.
            </p>
          </div>
        </BlurFade>
      </div>
    </div>
  )
}
