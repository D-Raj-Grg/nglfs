"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { BlurFade } from "@/components/ui/blur-fade"

const faqs = [
  {
    question: "How does anonymous messaging work?",
    answer:
      "Simply create your profile and share your unique link (e.g., nglfs.com/yourname) with friends. Anyone can visit your link and send you messages without creating an account or revealing their identity. You'll receive the messages in your private dashboard.",
  },
  {
    question: "Is it really anonymous? Can I find out who sent a message?",
    answer:
      "Yes, it's completely anonymous. We don't collect any identifying information from message senders. IP addresses are securely hashed (never stored in plain text) only for abuse prevention. There is no way to trace messages back to specific individuals.",
  },
  {
    question: "Do I need to sign up to send a message?",
    answer:
      "No! That's the beauty of NGLFS. Only the person receiving messages needs an account. Anyone can send anonymous messages just by visiting your public profile link - no signup, no login required.",
  },
  {
    question: "How do you prevent spam and abuse?",
    answer:
      "We implement strict rate limiting (3 messages per IP per hour), IP-based blocking for repeat offenders, and content filtering. You also have full control to delete unwanted messages and can report abusive content to our moderation team.",
  },
  {
    question: "Is my data secure and private?",
    answer:
      "Absolutely. We use industry-standard encryption, hash all IP addresses with SHA-256, implement Row Level Security in our database, and never sell your data. Your messages are only visible to you. We're privacy-first by design.",
  },
  {
    question: "Can I delete my account and all my data?",
    answer:
      "Yes, you have full control. You can permanently delete your account and all associated data (messages, analytics, profile information) at any time from your settings page. Deletion is immediate and irreversible.",
  },
]

export default function FAQSection() {
  return (
    <section className="relative bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A] py-24 md:py-32">
      <div className="container mx-auto max-w-4xl px-4">
        <BlurFade delay={0.1}>
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              Everything you need to know about anonymous messaging on NGLFS.
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.2}>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm md:p-8">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-white/10"
                >
                  <AccordionTrigger className="text-left text-base font-semibold text-white hover:text-[#8B5CF6] hover:no-underline md:text-lg">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </BlurFade>

        <BlurFade delay={0.3}>
          <div className="mt-12 text-center">
            <p className="text-gray-400">
              Still have questions?{" "}
              <a
                href="mailto:support@nglfs.com"
                className="text-[#8B5CF6] transition-colors hover:text-[#EC4899]"
              >
                Contact our support team
              </a>
            </p>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
