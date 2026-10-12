import type { Metadata } from "next"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { COMPANY, TEAM } from "@/lib/company"
import { PROJECT } from "@/lib/project-facts"

export const metadata: Metadata = {
  title: `About · ${PROJECT.name}`,
  description: `Meet the team behind ${PROJECT.name}, a voice integrity platform developed from forensic audio research.`,
}

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <section className="relative pt-28 sm:pt-36 pb-16 border-b border-border/40">
        <div className="absolute inset-0 home-hero-glow opacity-40 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-primary/80 mb-3">About</p>
          <h1 className="text-4xl sm:text-5xl font-orbitron font-bold leading-tight mb-6">
            Building voice integrity for the AI audio era
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{COMPANY.oneLiner}</p>
        </div>
      </section>

      <section className="py-16 sm:py-20 border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-muted-foreground leading-relaxed">
          <h2 className="text-2xl font-orbitron font-bold text-foreground">Our story</h2>
          <p>{COMPANY.researchOrigin}</p>
          <p>
            The product screens audio for synthetic speech cues across four independent evidence axes: origin,
            replay, channel processing, and partial fabrication. It returns structured indicators for human
            review. It is deployed publicly at{" "}
            <a
              href={`https://www.${COMPANY.domain}`}
              className="text-foreground underline underline-offset-4 hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              {COMPANY.domain}
            </a>{" "}
            with a working analysis lab and case studies based on real world public audio incidents.
          </p>
          <p className="text-sm border-l-2 border-primary/40 pl-4 text-foreground/80">{COMPANY.disclaimer}</p>
        </div>
      </section>

      <section className="py-16 sm:py-20 border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-orbitron font-bold mb-10">Team</h2>
          <ul className="space-y-10">
            {TEAM.map((member) => (
              <li key={member.name} className="border-t border-border/50 pt-8">
                <p className="font-orbitron text-[11px] tracking-[0.2em] uppercase text-primary mb-2">
                  {member.role}
                </p>
                <h3 className="text-2xl font-semibold mb-3">{member.name}</h3>
                <p className="text-muted-foreground leading-relaxed">{member.bio}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-orbitron font-bold mb-4">Contact</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            For partnerships, research collaboration, or product questions, email us at the domain address below.
          </p>
          <p className="font-mono text-foreground mb-8">
            <a href={`mailto:${COMPANY.contactEmail}`} className="text-primary hover:underline">
              {COMPANY.contactEmail}
            </a>
          </p>
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-full" asChild>
              <Link href="/dashboard">Open live demo</Link>
            </Button>
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
