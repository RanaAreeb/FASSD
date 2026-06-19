"use client"

import { Footer } from "@/components/footer"
import { ClientWrapper } from "@/components/client-wrapper"
import {
  HomeHero,
  HomeIntroSection,
  HomeArchitectureBento,
  HomePipelineSection,
  HomeCapabilitiesSection,
  HomeUseCasesSection,
  HomeCtaSection,
} from "@/components/home-sections"

export default function HomePage() {
  return (
    <ClientWrapper>
      <main className="min-h-screen overflow-x-hidden bg-background">
        <HomeHero />
        <HomeIntroSection />
        <HomeArchitectureBento />
        <HomePipelineSection />
        <HomeCapabilitiesSection />
        <HomeUseCasesSection />
        <HomeCtaSection />
        <Footer />
      </main>
    </ClientWrapper>
  )
}
