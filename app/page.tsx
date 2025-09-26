"use client"

import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { InteractiveDemo } from "@/components/interactive-demo"
import { Footer } from "@/components/footer"
import { ClientWrapper } from "@/components/client-wrapper"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { TechnologySection } from "@/components/technology-section"
import { TechnologyGlobeSection } from "@/components/technology-globe-section"
import { StatsSection } from "@/components/stats-section"
import { UseCasesSection } from "@/components/use-cases-section"
import { ScrollReveal } from "@/components/scroll-reveal"
import { useEffect } from "react"

export default function HomePage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth"
    return () => {
      document.documentElement.style.scrollBehavior = "auto"
    }
  }, [])

  return (
    <ClientWrapper>
      <main className="min-h-screen">
        <HeroSection />
        <ScrollReveal>
          <HowItWorksSection />
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <TechnologySection />
        </ScrollReveal>
        <ScrollReveal delay={300}>
          <TechnologyGlobeSection />
        </ScrollReveal>
        <ScrollReveal delay={400}>
          <FeaturesSection />
        </ScrollReveal>
        <ScrollReveal delay={600}>
          <StatsSection />
        </ScrollReveal>
        <ScrollReveal delay={800}>
          <UseCasesSection />
        </ScrollReveal>
        <ScrollReveal delay={1000}>
          <InteractiveDemo />
        </ScrollReveal>
        <Footer />
      </main>
    </ClientWrapper>
  )
}
