"use client"

import type React from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/button"
import { PipelineTimeline } from "@/components/pipeline-timeline"
import { HeroReveal, Reveal, RevealItem, RevealStagger } from "@/components/motion-reveal"
import { useMotionReady } from "@/components/motion-ready-context"
import {
  fadeUp,
  heroTitle,
  pipelineAsideContainer,
  pipelineAsideItem,
  reducedMotionTransition,
} from "@/lib/motion-presets"
import { ARCHITECTURE_AXES, PIPELINE_STEPS, PROJECT } from "@/lib/project-facts"
import { COMPANY, COMPANY_USE_CASES } from "@/lib/company"
import { ArrowRight, ChevronRight, ShieldCheck } from "lucide-react"

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-primary/80 mb-3">{children}</p>
  )
}

/* Full bleed signal field: edge to edge hero visual, not an inset card */
function HeroSignalField({ animate }: { animate: boolean }) {
  const bars = [
    22, 38, 28, 56, 34, 72, 44, 60, 30, 78, 48, 66, 36, 82, 40, 58, 26, 70, 46, 64, 32, 74, 42, 68, 28, 80, 50, 62, 34,
    76, 38, 54, 24, 70, 44, 66, 30, 78, 48, 60, 36, 72, 40, 58, 26, 68, 46, 64,
  ]
  return (
    <div className="absolute inset-x-0 bottom-0 h-[42%] sm:h-[48%] pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-transparent z-[1]" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-px h-full opacity-60 dark:opacity-75">
        {bars.map((h, i) => (
          <motion.span
            key={i}
            className="flex-1 min-w-0 rounded-t-[1px] bg-primary origin-bottom"
            style={{ height: `${h}%` }}
            initial={{ scaleY: 0.35, opacity: 0.25 }}
            animate={
              animate
                ? { scaleY: [0.55, 1, 0.7, 1], opacity: [0.35, 0.85, 0.5, 0.8] }
                : { scaleY: 0.75, opacity: 0.45 }
            }
            transition={
              animate
                ? {
                    duration: 2.4 + (i % 5) * 0.15,
                    delay: i * 0.02,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                  }
                : { duration: 0.01 }
            }
          />
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   HERO: brand first, full bleed, one composition
   ═══════════════════════════════════════════════════════════ */
export function HomeHero() {
  const motionReady = useMotionReady()
  const reduceMotion = useReducedMotion()
  const animateSignal = Boolean(motionReady && !reduceMotion)

  return (
    <section className="relative min-h-[100dvh] flex flex-col overflow-hidden">
      <div className="absolute inset-0 home-hero-grid pointer-events-none" />
      <div className="absolute inset-0 home-hero-glow pointer-events-none" />
      <HeroSignalField animate={animateSignal} />

      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 pb-[28vh] sm:pb-[32vh]">
        <div className="max-w-4xl space-y-7 sm:space-y-8">
          <h1 className="font-orbitron font-black leading-[0.9] tracking-tight">
            <HeroReveal delay={0.08} variants={heroTitle}>
              <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-foreground">
                {PROJECT.namePrimary}
              </span>
            </HeroReveal>
            <HeroReveal delay={0.18} variants={heroTitle}>
              <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-primary">
                {PROJECT.nameAccent}
              </span>
            </HeroReveal>
          </h1>

          <HeroReveal delay={0.32} variants={fadeUp}>
            <p className="text-lg sm:text-xl md:text-2xl text-foreground/90 font-light max-w-2xl leading-snug">
              Voice integrity screening for the AI audio era.
            </p>
          </HeroReveal>

          <HeroReveal delay={0.42} variants={fadeUp}>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
              Multi axis analysis for synthetic speech, replay, channel artifacts, and partial fabrication, built
              for human review.
            </p>
          </HeroReveal>

          <HeroReveal delay={0.52} variants={fadeUp}>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button size="lg" className="h-12 px-8 font-orbitron tracking-wide rounded-full" asChild>
                <Link href="/dashboard">
                  Open live demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 rounded-full bg-background/60 border-border/80 backdrop-blur-sm"
                asChild
              >
                <Link href="/#product">How it works</Link>
              </Button>
            </div>
          </HeroReveal>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT: what the company does
   ═══════════════════════════════════════════════════════════ */
export function HomeProductSection() {
  return (
    <section id="product" className="py-20 sm:py-28 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <Reveal direction="left" className="lg:col-span-5">
            <SectionLabel>Product</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-orbitron font-bold leading-tight">
              Screen synthetic speech with evidence, not a single score
            </h2>
          </Reveal>
          <Reveal direction="right" delay={0.08} className="lg:col-span-7 space-y-5 text-muted-foreground leading-relaxed">
            <p>
              DeepFakeDetection analyzes uploaded or recorded audio across four independent integrity axes:
              voice origin, replay and rerecording, mixer and channel processing, and partial fabrication segments.
              It then returns structured evidence for human review.
            </p>
            <p>
              The live product at{" "}
              <a
                href={`https://www.${COMPANY.domain}`}
                className="text-foreground underline underline-offset-4 hover:text-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                {COMPANY.domain}
              </a>{" "}
              runs the same Phase 9 inference stack used in our research pipeline: decode, segment, extract
              features (including WavLM SSL embeddings), score each axis, and fuse results with safe forensic
              wording.
            </p>
            <p className="text-sm border-l-2 border-primary/40 pl-4 text-foreground/80">{COMPANY.disclaimer}</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   ARCHITECTURE: four axes (clean, not card heavy)
   ═══════════════════════════════════════════════════════════ */
export function HomeArchitectureSection() {
  return (
    <section id="architecture" className="py-20 sm:py-28 bg-muted/15 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl mb-14">
          <SectionLabel>Architecture</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-orbitron font-bold">Four evidence axes</h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Each model reports separately. Fusion explains agreement and conflict. It does not invent a court ready
            authenticity verdict.
          </p>
        </Reveal>

        <RevealStagger className="grid sm:grid-cols-2 gap-x-10 gap-y-10" stagger={0.08}>
          {ARCHITECTURE_AXES.map((axis, i) => (
            <RevealItem key={axis.model}>
              <article className="border-t border-border/60 pt-6">
                <div className="flex items-baseline justify-between gap-4 mb-3">
                  <p className="font-orbitron text-xs tracking-[0.2em] uppercase text-primary">
                    {String(i + 1).padStart(2, "0")} · {axis.label}
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground">threshold ≥ {axis.threshold}</p>
                </div>
                <h3 className="text-lg font-semibold mb-2">{axis.features}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{axis.note}</p>
              </article>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   PIPELINE
   ═══════════════════════════════════════════════════════════ */
export function HomePipelineSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="pipeline" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_40%,oklch(0.55_0.12_220/0.08),transparent)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          <motion.aside
            className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10% 0px -8% 0px", amount: 0.35 }}
            variants={pipelineAsideContainer}
            transition={reduceMotion ? reducedMotionTransition : undefined}
          >
            <motion.div variants={pipelineAsideItem}>
              <SectionLabel>Pipeline</SectionLabel>
            </motion.div>
            <motion.h2
              variants={pipelineAsideItem}
              className="text-3xl sm:text-4xl font-orbitron font-bold leading-tight"
            >
              From upload to evidence report
            </motion.h2>
            <motion.p variants={pipelineAsideItem} className="text-muted-foreground mt-4 text-sm leading-relaxed">
              Every demo run follows the same {PIPELINE_STEPS.length} stage path used by the production FastAPI
              service.
            </motion.p>
            <motion.div variants={pipelineAsideItem}>
              <Button className="mt-8 rounded-full group" variant="outline" asChild>
                <Link href="/dashboard">
                  Try the live lab
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </motion.div>
          </motion.aside>

          <div className="lg:col-span-8">
            <PipelineTimeline />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   USE CASES
   ═══════════════════════════════════════════════════════════ */
export function HomeUseCasesSection() {
  return (
    <section id="use-cases" className="py-20 sm:py-28 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <Reveal direction="left">
            <div>
              <SectionLabel>Use cases</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-orbitron font-bold">Built for real audio workflows</h2>
            </div>
          </Reveal>
          <Reveal direction="right" delay={0.08} className="text-sm text-muted-foreground max-w-md leading-relaxed">
            <p>
              Pair automated evidence with human judgment. Explore public case studies for how multi axis screening
              behaves on real world clips.
            </p>
            <Link
              href="/case-studies"
              className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline mt-3"
            >
              View case studies
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>

        <RevealStagger className="grid sm:grid-cols-2 gap-8" stagger={0.08}>
          {COMPANY_USE_CASES.map((uc, i) => (
            <RevealItem key={uc.title}>
              <article className="border-t border-border/60 pt-6 h-full">
                <p className="font-orbitron text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="text-xl font-semibold mb-3">{uc.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{uc.description}</p>
              </article>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   RESEARCH ORIGIN: credible, not FYP first
   ═══════════════════════════════════════════════════════════ */
export function HomeOriginSection() {
  return (
    <section id="research" className="py-20 sm:py-28 bg-muted/15 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <Reveal className="lg:col-span-7">
            <SectionLabel>Research to product</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-orbitron font-bold leading-tight mb-5">
              From forensic audio R&D to a cloud voice integrity platform
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">{COMPANY.researchOrigin}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="outline" className="rounded-full" asChild>
                <Link href="/about">About the team</Link>
              </Button>
              <Button variant="ghost" className="rounded-full" asChild>
                <Link href="/case-studies">Real world case studies</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5">
            <div className="rounded-2xl border border-border/50 bg-card/60 p-6 sm:p-8 space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Working product</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Signed in users can upload, record, or generate lab audio and run the live multi axis analysis
                    pipeline today.
                  </p>
                </div>
              </div>
              <div className="h-px bg-border/50" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Domain:{" "}
                <span className="font-mono text-foreground">{COMPANY.domain}</span>
                <br />
                Contact:{" "}
                <a href={`mailto:${COMPANY.contactEmail}`} className="text-primary hover:underline">
                  {COMPANY.contactEmail}
                </a>
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   CTA
   ═══════════════════════════════════════════════════════════ */
export function HomeCtaSection() {
  return (
    <section id="try" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-border/50">
            <div className="absolute inset-0 home-hero-glow opacity-50 pointer-events-none" />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, oklch(0.35 0.08 220 / 0.25), transparent 55%)",
              }}
            />
            <div className="relative px-8 sm:px-16 py-16 sm:py-20 max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-orbitron font-bold mb-4">
                Run a real analysis in minutes
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Create an account, open the analysis lab, and screen a recording through the same multi axis engine
                powering our public demo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="rounded-full h-12 px-8 font-orbitron" asChild>
                  <Link href="/signup">Get started</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full h-12 px-8 bg-transparent" asChild>
                  <Link href="/dashboard">Open demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
