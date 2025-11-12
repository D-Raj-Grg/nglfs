"use client";

import { Check, Heart, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pricing() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, <span className="gradient-text-primary">Transparent</span>{" "}
            Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            NGLFS is completely free and open source. Forever.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-12 relative overflow-hidden group hover:glass-strong transition-smooth">
            {/* Decorative gradient orbs */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl group-hover:scale-125 transition-transform duration-700"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center">
                  <Heart className="h-8 w-8 text-white fill-white" />
                </div>
              </div>

              <h3 className="text-3xl md:text-4xl font-bold text-center mb-3">
                Free & Open Source
              </h3>
              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="text-6xl md:text-7xl font-bold gradient-text-primary">
                  $0
                </span>
                <span className="text-2xl text-muted-foreground">/forever</span>
              </div>

              <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
                NGLFS is built with love for the community. No hidden fees, no
                premium plans, no paywalls. Just honest, anonymous messaging for
                everyone.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Button
                  size="lg"
                  className="gradient-primary text-white hover:opacity-90 transition-opacity px-8 rounded-full"
                  asChild
                >
                  <a href="/signup">Get Started Free</a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 rounded-full glass hover:glass-strong"
                  asChild
                >
                  <a
                    href="https://github.com/yourusername/nglfs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Github className="h-5 w-5" />
                    View on GitHub
                  </a>
                </Button>
              </div>

              <div className="mt-8 pt-8 border-t border-border/50">
                <p className="text-center text-sm text-muted-foreground">
                  Built with Next.js, React, and TypeScript.{" "}
                  <span className="gradient-text-primary font-semibold">
                    Self-host it yourself
                  </span>{" "}
                  or use our hosted version.
                </p>
              </div>
            </div>
          </div>

          {/* Additional info cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="glass-card p-6 text-center hover:glass-strong transition-smooth">
              <div className="text-3xl font-bold gradient-text-primary mb-2">
                100%
              </div>
              <p className="text-sm text-muted-foreground">Open Source</p>
            </div>
            <div className="glass-card p-6 text-center hover:glass-strong transition-smooth">
              <div className="text-3xl font-bold gradient-text-primary mb-2">
                No Ads
              </div>
              <p className="text-sm text-muted-foreground">
                Ever. We promise.
              </p>
            </div>
            <div className="glass-card p-6 text-center hover:glass-strong transition-smooth">
              <div className="text-3xl font-bold gradient-text-primary mb-2">
                Privacy First
              </div>
              <p className="text-sm text-muted-foreground">
                Your data is yours
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  "Unlimited anonymous messages",
  "Beautiful, modern interface",
  "Advanced analytics dashboard",
  "Real-time message notifications",
  "Custom profile customization",
  "Message filtering & moderation",
  "Export your data anytime",
  "Self-hostable on your own server",
  "Active community support",
  "Regular updates & new features",
  "No tracking or data selling",
  "Mobile-responsive design",
];
