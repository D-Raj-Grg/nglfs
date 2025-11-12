"use client";

import { cn } from "@/lib/utils";
import Marquee from "@/components/magicui/marquee";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    username: "@sarahchen",
    body: "Finally, a platform where I can get honest feedback without the fear of judgment. NGLFS changed how I connect with my audience!",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    username: "@marcusr",
    body: "The anonymous messaging feature is perfect for creators. I've received some of the most valuable insights about my content here.",
    rating: 5,
  },
  {
    name: "Emily Thompson",
    username: "@emilyt",
    body: "Love the clean interface and the glassmorphism design. It's beautiful AND functional. Best anonymous messaging platform I've used.",
    rating: 5,
  },
  {
    name: "Alex Kumar",
    username: "@alexk",
    body: "As a content creator, this has been invaluable. My followers can share their thoughts freely, and I get real, unfiltered feedback.",
    rating: 5,
  },
  {
    name: "Jessica Park",
    username: "@jessicap",
    body: "The privacy features are top-notch. I feel safe knowing that my messages are truly anonymous and secure.",
    rating: 5,
  },
  {
    name: "David Lee",
    username: "@davidlee",
    body: "Simple, elegant, and powerful. NGLFS does one thing and does it extremely well. Highly recommend for any creator!",
    rating: 5,
  },
  {
    name: "Nina Patel",
    username: "@ninap",
    body: "The analytics dashboard helps me understand my audience better. Plus, the anonymous messages are always genuine and helpful.",
    rating: 5,
  },
  {
    name: "Ryan Mitchell",
    username: "@ryanm",
    body: "I've tried other platforms, but NGLFS stands out with its modern design and focus on privacy. It's my go-to now.",
    rating: 5,
  },
];

const firstRow = testimonials.slice(0, testimonials.length / 2);
const secondRow = testimonials.slice(testimonials.length / 2);

const TestimonialCard = ({
  name,
  username,
  body,
  rating,
}: {
  name: string;
  username: string;
  body: string;
  rating: number;
}) => {
  return (
    <figure
      className={cn(
        "relative w-80 cursor-pointer overflow-hidden rounded-2xl p-6",
        "glass-card hover:glass-strong transition-smooth",
      )}
    >
      <div className="flex flex-row items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold">
          {name.charAt(0)}
        </div>
        <div className="flex flex-col">
          <figcaption className="text-sm font-semibold">
            {name}
          </figcaption>
          <p className="text-xs text-muted-foreground">{username}</p>
        </div>
      </div>
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
        ))}
      </div>
      <blockquote className="text-sm leading-relaxed">{body}</blockquote>
    </figure>
  );
};

export function Testimonials() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Loved by{" "}
            <span className="gradient-text-primary">thousands</span> of creators
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join the growing community of creators who trust NGLFS for honest,
            anonymous feedback
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <Marquee pauseOnHover className="[--duration:40s]">
            {firstRow.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:40s]">
            {secondRow.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
        </div>
      </div>
    </section>
  );
}
