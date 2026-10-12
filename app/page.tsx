"use client"

import { Footer } from "@/components/footer"
import { ClientWrapper } from "@/components/client-wrapper"
import {
  HomeHero,
  HomeProductSection,
  HomeArchitectureSection,
  HomePipelineSection,
  HomeUseCasesSection,
  HomeOriginSection,
  HomeCtaSection,
} from "@/components/home-sections"

export default function HomePage() {
  return (
    <ClientWrapper>
      <main className="min-h-screen overflow-x-hidden bg-background">
        <HomeHero />
        <HomeProductSection />
        <HomeArchitectureSection />
        <HomePipelineSection />
        <HomeUseCasesSection />
        <HomeOriginSection />
        <HomeCtaSection />
        <Footer />
      </main>
    </ClientWrapper>
  )
}
