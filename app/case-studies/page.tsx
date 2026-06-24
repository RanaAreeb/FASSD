"use client"

import { ClientWrapper } from "@/components/client-wrapper"
import { CaseStudiesView } from "@/components/case-studies-view"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"

export default function CaseStudiesPage() {
  return (
    <ClientWrapper>
      <Navigation />
      <main className="min-h-screen bg-background pt-16 lg:pt-20">
        <CaseStudiesView />
        <Footer />
      </main>
    </ClientWrapper>
  )
}
