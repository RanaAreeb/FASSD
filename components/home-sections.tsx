"use client"

import type React from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { PipelineTimeline } from "@/components/pipeline-timeline"
import { HeroReveal, Reveal, RevealItem, RevealStagger } from "@/components/motion-reveal"
import { useMotionReady } from "@/components/motion-ready-context"
import { fadeIn, fadeUp, heroPanel, heroTitle, EASE_OUT_EXPO, pipelineAsideContainer, pipelineAsideItem, reducedMotionTransition } from "@/lib/motion-presets"
import { cn } from "@/lib/utils"
import {
  CAPABILITIES,
  INFERENCE_DEFAULTS,
  BENTO_SMALL_TILES,
  MODEL_SPECS,
  PROJECT,
  USE_CASES,
  VALIDATION_NOTE,
} from "@/lib/project-facts"
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Mic,
  Radio,
  Shield,
  Upload,
} from "lucide-react"

/* ─── Decorative spectrogram (pure CSS, no fake data) ─── */
function SpectrogramArt({ className }: { className?: string }) {
  const motionReady = useMotionReady()
  const reduceMotion = useReducedMotion()
  const heights = [28, 52, 38, 72, 48, 88, 56, 64, 42, 76, 34, 68, 50, 82, 44, 60, 36, 74, 46, 58]
  return (
    <div className={cn("flex items-end justify-center gap-[3px] h-full min-h-[200px] px-2", className)}>
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="w-[5px] sm:w-[6px] rounded-full bg-primary/50"
          initial={{ height: 8, opacity: 0.2 }}
          animate={
            motionReady && !reduceMotion
              ? { height: h, opacity: 0.45 + (i % 5) * 0.08 }
              : { height: h * 0.7, opacity: 0.35 }
          }
          transition={
            reduceMotion
              ? { duration: 0.01 }
              : {
                  duration: 1.2,
                  delay: 0.5 + i * 0.04,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 0.25,
                }
          }
        />
      ))}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-primary/80 mb-3">{children}</p>
  )
}

/* ═══════════════════════════════════════════════════════════
   HERO — cinematic, asymmetric, designer-led
   ═══════════════════════════════════════════════════════════ */
export function HomeHero() {
  const motionReady = useMotionReady()

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-end overflow-hidden home-hero-grid">
      <div className="absolute inset-0 home-hero-glow pointer-events-none" />
      <motion.div
        className="absolute top-32 right-0 w-px h-40 bg-primary/20 hidden lg:block origin-top"
        initial={{ scaleY: 0 }}
        animate={motionReady ? { scaleY: 1 } : { scaleY: 0 }}
        transition={{ duration: 1, delay: 0.8, ease: EASE_OUT_EXPO }}
      />
      <HeroReveal delay={0.7} variants={fadeUp}>
        <div className="absolute top-48 right-8 text-[10px] font-mono text-muted-foreground/50 rotate-90 origin-right hidden lg:block tracking-widest">
          16 KHZ · MONO · PHASE 9
        </div>
      </HeroReveal>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 lg:pt-32 pb-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 xl:col-span-7 space-y-8">
            <HeroReveal delay={0.05} variants={fadeUp}>
              <div className="inline-flex items-center gap-3 border border-border/60 rounded-full pl-1 pr-4 py-1 bg-card/50 backdrop-blur-sm">
                <span className="bg-primary text-primary-foreground text-[10px] font-mono px-2.5 py-1 rounded-full">
                  FYP 2025
                </span>
                <span className="text-xs text-muted-foreground tracking-wide">Phase 9 · Four evidence axes</span>
              </div>
            </HeroReveal>

            <h1 className="font-orbitron font-black leading-[0.92] tracking-tight">
              <HeroReveal delay={0.12} variants={heroTitle}>
                <span className="block text-5xl sm:text-6xl md:text-7xl xl:text-8xl text-foreground">DeepFake</span>
              </HeroReveal>
              <HeroReveal delay={0.22} variants={heroTitle}>
                <span className="block text-5xl sm:text-6xl md:text-7xl xl:text-8xl text-primary">Detection</span>
              </HeroReveal>
            </h1>

            <HeroReveal delay={0.38} variants={fadeUp}>
              <p className="text-lg sm:text-xl text-muted-foreground font-light max-w-md pt-2 pl-1 border-l-2 border-primary/50">
                Synthetic speech screening with four separate integrity checks, built for demos, research, and
                thesis defense.
              </p>
            </HeroReveal>

            <HeroReveal delay={0.5} variants={fadeUp}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="h-12 px-8 font-orbitron tracking-wide rounded-full" asChild>
                  <Link href="/dashboard">
                    Launch analysis lab
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 rounded-full bg-transparent border-border/80"
                  asChild
                >
                  <Link href="/#architecture">Explore architecture</Link>
                </Button>
              </div>
            </HeroReveal>
          </div>

          <HeroReveal delay={0.28} variants={heroPanel} className="lg:col-span-6 xl:col-span-5 relative">
            <motion.div
              className="relative rounded-3xl border border-border/50 bg-card/40 backdrop-blur-md overflow-hidden"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            >
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="hero-scanline absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
              </div>
              <div className="p-6 sm:p-8 border-b border-border/40">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Signal view</p>
                    <p className="text-sm font-medium mt-1">WavLM SSL · acoustic features</p>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  </div>
                </div>
                <SpectrogramArt />
              </div>
              <div className="p-5 sm:p-6 bg-muted/15">
                <div className="h-20 rounded-xl border border-border/40 bg-background/40 px-3 flex items-center">
                  <AudioVisualizer isActive />
                </div>
                <p className="text-[10px] font-mono text-muted-foreground mt-3 text-center tracking-wide">
                  LIVE VISUALIZER · UI PREVIEW
                </p>
              </div>
            </motion.div>
            <motion.div
              className="absolute -bottom-3 -left-3 hidden sm:block px-4 py-2 rounded-xl border border-border/60 bg-card text-xs font-mono shadow-lg"
              initial={{ opacity: 0, y: 8 }}
              animate={motionReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ delay: 0.9, duration: 0.5, ease: EASE_OUT_EXPO }}
            >
              4 models · segment fusion
            </motion.div>
          </HeroReveal>
        </div>
      </div>

      <Reveal direction="fade" delay={0.1} className="relative z-10 border-t border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <RevealStagger className="flex flex-wrap items-center justify-center lg:justify-between gap-6 text-center lg:text-left" stagger={0.06}>
            {MODEL_SPECS.slice(0, 4).map((s) => (
              <RevealItem key={s.label} className="min-w-[120px]">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className="text-sm font-mono font-medium mt-0.5">{s.value}</p>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </Reveal>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   INTRO — editorial full-width (not bento)
   ═══════════════════════════════════════════════════════════ */
export function HomeIntroSection() {
  return (
    <section className="py-20 sm:py-28 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <Reveal direction="left">
            <div>
              <SectionLabel>About the system</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-orbitron font-bold leading-tight">
                A complete pipeline from raw audio to explainable verdict
              </h2>
            </div>
          </Reveal>
          <Reveal direction="right" delay={0.1}>
            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>{PROJECT.tagline}</p>
              <p>
                The web dashboard calls the Phase 9 FastAPI service in{" "}
                <code className="text-xs text-foreground bg-muted px-1.5 py-0.5 rounded">new backend/release/</code>
                No mock scores. Each upload runs decode, segmentation, four axis models, and multi-axis fusion with
                safe forensic wording.
              </p>
              <p className="text-sm border-l-2 border-muted-foreground/30 pl-4">{PROJECT.disclaimer}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   ARCHITECTURE BENTO — the only bento section on the page
   ═══════════════════════════════════════════════════════════ */
export function HomeArchitectureBento() {
  return (
    <section id="architecture" className="py-20 sm:py-28 bg-muted/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-10 max-w-xl">
          <SectionLabel>Architecture</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-orbitron font-bold">Model & inference at a glance</h2>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            Values match the Phase 9 release backend: model registry, segmentation defaults, and candidate
            thresholds.
          </p>
        </Reveal>

        <RevealStagger
          className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 auto-rows-fr"
          stagger={0.07}
        >
          <RevealItem className="col-span-2 lg:col-span-3 lg:row-span-2 rounded-3xl border border-border/60 bg-card p-6 sm:p-8 flex flex-col">
            <div className="flex-1">
              <Badge variant="outline" className="mb-4 font-mono text-[10px]">
                Phase 9B · experimental
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-orbitron font-bold leading-snug">
                Four experimental evidence models
              </h3>
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed max-w-md">
                Origin (WavLM SSL), replay (acoustic), mixer/channel (acoustic), and partial segments (combined
                features), fused into separate indicators, not one binary fake/real verdict.
              </p>
            </div>
            <p className="text-xs font-mono text-primary mt-6">release/models/ · joblib + metadata</p>
          </RevealItem>

          {BENTO_SMALL_TILES.map((tile) => (
            <RevealItem
              key={tile.key}
              className="col-span-1 rounded-2xl border border-border/60 bg-card p-4 sm:p-5 flex flex-col h-full"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-tight">{tile.label}</p>
                <span className="text-[9px] font-mono text-primary/80 shrink-0">{tile.meta}</span>
              </div>
              <p className="text-sm font-mono font-semibold leading-snug flex-1">{tile.value}</p>
            </RevealItem>
          ))}

          <RevealItem className="col-span-2 lg:col-span-3 rounded-2xl border border-primary/25 bg-primary/5 p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-wider text-primary mb-3">Axis thresholds (candidate)</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {INFERENCE_DEFAULTS.map((d) => (
                <div key={d.label} className="flex justify-between gap-2 text-sm border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-mono text-xs text-right">{d.value}</span>
                </div>
              ))}
            </div>
          </RevealItem>

          <RevealItem className="col-span-2 lg:col-span-3 rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Validation · Phase 9C / 9D
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">{VALIDATION_NOTE}</p>
          </RevealItem>
        </RevealStagger>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   PIPELINE — vertical timeline (not bento)
   ═══════════════════════════════════════════════════════════ */
export function HomePipelineSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="pipeline" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_40%,oklch(0.65_0.25_260/0.06),transparent)]" />

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
              Five stages per upload
            </motion.h2>
            <motion.p variants={pipelineAsideItem} className="text-muted-foreground mt-4 text-sm leading-relaxed">
              Same flow in the release CLI and the{" "}
              <span className="font-mono text-foreground">/analyze</span> endpoint.
            </motion.p>
            <motion.div variants={pipelineAsideItem}>
              <Button className="mt-8 rounded-full group" variant="outline" asChild>
                <Link href="/dashboard">
                  Try the pipeline
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

const CAPABILITY_NUMBER_COLORS = [
  "text-primary",
  "text-emerald-400",
  "text-cyan-400",
  "text-amber-400",
  "text-violet-400",
] as const

/* ═══════════════════════════════════════════════════════════
   CAPABILITIES — staggered feature rows
   ═══════════════════════════════════════════════════════════ */
export function HomeCapabilitiesSection() {
  return (
    <section id="features" className="py-20 sm:py-28 border-t border-border/40 bg-card/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <SectionLabel>Platform</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-orbitron font-bold">What you can demonstrate today</h2>
        </Reveal>

        <div className="space-y-0 divide-y divide-border/50">
          {CAPABILITIES.map((cap, index) => (
            <Reveal
              key={cap.title}
              delay={index * 0.06}
              direction={index % 2 === 0 ? "left" : "right"}
              className={cn(
                "grid md:grid-cols-12 gap-6 py-10 first:pt-0 items-center",
                index % 2 === 1 && "md:[&>div:first-child]:order-2",
              )}
            >
              <div className="md:col-span-2">
                <span
                  className={cn(
                    "text-4xl sm:text-5xl font-orbitron font-black tabular-nums leading-none",
                    CAPABILITY_NUMBER_COLORS[index % CAPABILITY_NUMBER_COLORS.length],
                  )}
                  style={{ filter: "none" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="md:col-span-7">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">{cap.title}</h3>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {cap.tag}
                  </Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed">{cap.description}</p>
              </div>
              <div className="md:col-span-3 md:text-right">
                <span className="inline-block w-12 h-px bg-primary/40 md:ml-auto" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const USE_CASE_ICONS = {
  media: Radio,
  security: Shield,
  research: BookOpen,
  calls: Upload,
} as const

/* ═══════════════════════════════════════════════════════════
   USE CASES — editorial cards
   ═══════════════════════════════════════════════════════════ */
export function HomeUseCasesSection() {
  return (
    <section id="use-cases" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <Reveal direction="left">
            <div>
              <SectionLabel>Use cases</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-orbitron font-bold">Where teams apply screening</h2>
            </div>
          </Reveal>
          <Reveal direction="right" delay={0.08} className="text-sm text-muted-foreground max-w-md leading-relaxed space-y-3">
            <p>
              Always pair model output with human judgment. Suitable for FYP demos, workshops, and media workflows.
            </p>
            <Link
              href="/case-studies"
              className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline"
            >
              Real-world case studies
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>

        <RevealStagger className="grid sm:grid-cols-2 gap-6" stagger={0.1}>
          {USE_CASES.map((uc, i) => {
            const Icon = USE_CASE_ICONS[uc.icon]
            return (
              <RevealItem key={uc.title} direction="scale">
              <motion.article
                className="group relative rounded-2xl border border-border/60 bg-card p-8 overflow-hidden transition-colors hover:border-primary/30 h-full"
                whileHover={{ y: -6, transition: { duration: 0.25, ease: EASE_OUT_EXPO } }}
              >
                <span className="absolute top-6 right-6 text-6xl font-orbitron font-black text-muted/20 select-none">
                  {i + 1}
                </span>
                <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center mb-6 group-hover:border-primary/30 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 pr-12">{uc.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{uc.description}</p>
              </motion.article>
              </RevealItem>
            )
          })}
        </RevealStagger>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   CTA — full-bleed closing panel
   ═══════════════════════════════════════════════════════════ */
export function HomeCtaSection() {
  return (
    <section id="try" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal direction="scale" duration={0.8}>
        <div className="relative rounded-[2rem] border border-border/60 bg-card overflow-hidden">
          <div className="absolute inset-0 home-hero-glow opacity-60 pointer-events-none" />
          <div className="relative px-8 sm:px-16 py-16 sm:py-20 text-center max-w-2xl mx-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
            >
              <Mic className="w-10 h-10 text-primary mx-auto mb-6 opacity-80" />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-orbitron font-bold mb-4">Upload real audio. Get a real report.</h2>
            <p className="text-muted-foreground leading-relaxed mb-10">
              Sign in, open the forensic lab, and run your file through the hybrid model: explanations, thresholds,
              and multiclass hints included.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full h-12 px-10 font-orbitron" asChild>
                <Link href="/signin">Get started</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-12 px-10 bg-transparent" asChild>
                <Link href="/dashboard">Open lab</Link>
              </Button>
            </div>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  )
}
