"use client"

import { MagicCard } from "@/components/ui/magic-card"
import { BlurFade } from "@/components/ui/blur-fade"
import { MessageSquare, BarChart3, Shield, Sparkles } from "lucide-react"

const features = [
  {
    icon: MessageSquare,
    title: "Anonymous Messaging",
    description:
      "Receive honest feedback without the pressure. Your friends can send messages completely anonymously with no signup required.",
    gradient: "#8B5CF6",
  },
  {
    icon: Sparkles,
    title: "Beautiful Inbox",
    description:
      "Manage all your messages in a stunning, easy-to-use interface. Mark as read, delete, or search through your messages effortlessly.",
    gradient: "#EC4899",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track your profile visits, message trends, and engagement metrics. Understand when and how people interact with your profile.",
    gradient: "#3B82F6",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your data is protected with industry-standard encryption. IP addresses are hashed, never stored in plain text. Built with security in mind.",
    gradient: "#06B6D4",
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative bg-[#0A0A0A] py-24 md:py-32">
      <div className="container mx-auto px-4">
        <BlurFade delay={0.1}>
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Everything You Need
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              A complete anonymous messaging platform with powerful features to
              help you connect authentically.
            </p>
          </div>
        </BlurFade>

        {/* Bento Grid Layout */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {features.map((feature, index) => (
            <BlurFade key={feature.title} delay={0.2 + index * 0.1}>
              <MagicCard
                className="group h-full border border-white/5 bg-[#1A1A1A] p-8 backdrop-blur-sm transition-all hover:border-white/10"
                gradientColor={feature.gradient}
                gradientSize={300}
                gradientOpacity={0.3}
              >
                <div className="flex h-full flex-col">
                  {/* Icon */}
                  <div
                    className="mb-6 flex size-14 items-center justify-center rounded-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${feature.gradient}20, ${feature.gradient}10)`,
                    }}
                  >
                    <feature.icon
                      className="size-7"
                      style={{ color: feature.gradient }}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="mb-3 text-2xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </MagicCard>
            </BlurFade>
          ))}
        </div>

        {/* Stats Section */}
        <BlurFade delay={0.6}>
          <div className="mt-20 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center backdrop-blur-sm">
              <div className="mb-2 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-5xl font-bold text-transparent">
                100%
              </div>
              <div className="text-gray-400">Anonymous</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center backdrop-blur-sm">
              <div className="mb-2 bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] bg-clip-text text-5xl font-bold text-transparent">
                0
              </div>
              <div className="text-gray-400">Ads or Tracking</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center backdrop-blur-sm">
              <div className="mb-2 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-5xl font-bold text-transparent">
                Instant
              </div>
              <div className="text-gray-400">Setup</div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
