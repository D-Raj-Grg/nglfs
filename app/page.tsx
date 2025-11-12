import Header from "@/components/landing/Header"
import HeroSection from "@/components/landing/HeroSection"
import FeaturesSection from "@/components/landing/FeaturesSection"
import { Testimonials } from "@/components/testimonials"
import { Pricing } from "@/components/pricing"
import FAQSection from "@/components/landing/FAQSection"
import Footer from "@/components/landing/Footer"

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <HeroSection />
        <FeaturesSection />
        <Testimonials />
        <Pricing />
        <FAQSection />
        <Footer />
      </main>
    </>
  )
}
