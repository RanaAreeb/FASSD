"use client"

import type React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AudioWaveformDisplay } from "@/components/audio-waveform-display"
import { cn } from "@/lib/utils"
import type { DetectionResult, EvidenceAxisCard } from "@/lib/detection-types"
import { FILE_VERDICT_LABELS, fileVerdictTag } from "@/lib/verdict-labels"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  HelpCircle,
  History,
  Mic2,
  Radio,
  RotateCcw,
  Scissors,
  SlidersHorizontal,
  Sparkles,
  XCircle,
} from "lucide-react"

interface DetectionResultsProps {
  result: DetectionResult
  audioFile?: File | null
  onNewAnalysis: () => void
}

const VERDICT_THEME = {
  error: {
    icon: XCircle,
    accent: "text-red-400",
    bg: "from-red-500/15 via-red-500/5 to-transparent",
    badge: "bg-red-500/15 text-red-200 border-red-400/40",
    ring: "border-red-400/30",
  },
  uncertain: {
    icon: HelpCircle,
    accent: "text-amber-400",
    bg: "from-amber-500/15 via-amber-500/5 to-transparent",
    badge: "bg-amber-500/15 text-amber-100 border-amber-400/40",
    ring: "border-amber-400/30",
  },
  ai_likely: {
    icon: AlertCircle,
    accent: "text-orange-400",
    bg: "from-orange-500/15 via-orange-500/5 to-transparent",
    badge: "bg-orange-500/15 text-orange-100 border-orange-400/40",
    ring: "border-orange-400/30",
  },
  human_likely: {
    icon: CheckCircle2,
    accent: "text-emerald-400",
    bg: "from-emerald-500/15 via-emerald-500/5 to-transparent",
    badge: "bg-emerald-500/15 text-emerald-100 border-emerald-400/40",
    ring: "border-emerald-400/30",
  },
} as const

const AXIS_UI: Record<
  string,
  { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }
> = {
  "ai-origin": {
    title: "Voice source",
    subtitle: "Human speaker vs AI-generated voice",
    icon: Mic2,
  },
  replay: {
    title: "Recording chain",
    subtitle: "Replay or re-recording patterns",
    icon: Radio,
  },
  channel: {
    title: "Channel & mix",
    subtitle: "Processing, routing, or mixer artifacts",
    icon: SlidersHorizontal,
  },
  partial: {
    title: "Edited segments",
    subtitle: "Small regions that may not match the rest",
    icon: Scissors,
  },
}

const PHASE9_CHECKS = [
  { key: "spectralAnalysis" as const, label: "Voice source", hint: "How likely the voice itself is AI-made" },
  { key: "temporalConsistency" as const, label: "Replay signs", hint: "Clues of playback or re-capture" },
  { key: "neuralNetworkScore" as const, label: "Mix & channel", hint: "Unusual routing or post-processing" },
  { key: "artifactDetection" as const, label: "Patchy edits", hint: "Short spans that stand out from the file" },
]

function axisUiKey(name: string): keyof typeof AXIS_UI {
  const n = name.toLowerCase()
  if (n.includes("origin") || n.includes("ai-origin")) return "ai-origin"
  if (n.includes("replay")) return "replay"
  if (n.includes("channel") || n.includes("mixer")) return "channel"
  return "partial"
}

function statusTone(card: EvidenceAxisCard) {
  const severity = card.severity ?? "clear"
  if (severity === "review") return { label: "Flagged", className: "text-orange-300 bg-orange-500/15 border-orange-400/30" }
  if (severity === "candidate")
    return { label: "Listen here", className: "text-amber-200 bg-amber-500/15 border-amber-400/30" }
  if (severity === "unavailable")
    return { label: "Unavailable", className: "text-slate-300 bg-slate-500/10 border-slate-400/20" }
  return { label: "Clear", className: "text-emerald-200 bg-emerald-500/10 border-emerald-400/25" }
}

export function DetectionResults({ result, audioFile, onNewAnalysis }: DetectionResultsProps) {
  const isPhase9 = result.backend === "phase9" && !!result.phase9
  const p9 = result.phase9
  const isErrorState = result.attackType === "Error"
  const tag = isErrorState ? "error" : fileVerdictTag(result.isDeepfake)
  const copy = FILE_VERDICT_LABELS[tag]
  const theme = VERDICT_THEME[tag]
  const VerdictIcon = theme.icon

  const headline = isPhase9
    ? simplifyVoiceOrigin(p9?.voiceOriginText ?? copy.title)
    : copy.title

  const summary =
    isPhase9 && p9?.plainLanguageExplanation
      ? p9.plainLanguageExplanation
      : isPhase9 && p9?.forensicIndicatorSummary
        ? p9.forensicIndicatorSummary
        : copy.description

  const highlights = p9?.segmentHighlights?.map((s) => ({
    startSec: s.startSec,
    endSec: s.endSec,
    rank: s.rank,
    label: s.label,
  }))

  return (
    <div className="space-y-5 animate-float-up">
      {/* Audio waveform — real file, not decorative animation */}
      {!isErrorState && (
        <Card className="overflow-hidden border-border/60 bg-card/80 shadow-xl shadow-primary/5">
          <CardContent className="p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" title={result.filename}>
                  {result.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  Your recording · {result.duration} · {result.fileSize}
                </p>
              </div>
              {highlights && highlights.length > 0 && (
                <Badge variant="outline" className="text-[10px] border-amber-400/40 text-amber-200">
                  {highlights.length} region{highlights.length === 1 ? "" : "s"} highlighted
                </Badge>
              )}
            </div>
            <AudioWaveformDisplay file={audioFile ?? null} highlights={highlights} height={128} />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              The shape above is your actual audio. Amber bands mark short spans our segment check thinks deserve a
              second listen.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Verdict hero */}
      <Card className={cn("relative overflow-hidden border-border/60 bg-card/90", theme.ring, "border")}>
        <div className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none opacity-80", theme.bg)} />
        <CardContent className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl border flex items-center justify-center shrink-0",
                theme.badge,
              )}
            >
              <VerdictIcon className={cn("w-8 h-8", theme.accent)} />
            </div>

            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                  {isPhase9 ? "Voice integrity scan" : "Screening result"}
                </Badge>
                {isPhase9 && p9?.caseId && (
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {p9.caseId}
                  </Badge>
                )}
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">{headline}</h2>
                <p className="mt-2 text-base text-muted-foreground leading-relaxed max-w-2xl">{summary}</p>
              </div>

              {isPhase9 && p9?.recommendation && (
                <div className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm leading-relaxed">
                  <span className="font-medium text-foreground">What to do next: </span>
                  {p9.recommendation}
                </div>
              )}

              {!isErrorState && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <MetaPill icon={Clock} label="Scan time" value={`${result.processingTime}s`} />
                  {isPhase9 && p9?.confidenceText && (
                    <MetaPill icon={Sparkles} label="Confidence" value={p9.confidenceText} />
                  )}
                  {!isPhase9 && (
                    <MetaPill icon={Sparkles} label="Strength" value={`${result.confidence}%`} />
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isErrorState && result.overallExplanation && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 text-sm text-red-100/90 leading-relaxed">{result.overallExplanation}</CardContent>
        </Card>
      )}

      {/* Four checks — plain language */}
      {!isErrorState && isPhase9 && p9 && p9.evidenceAxisCards.length > 0 && (
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold">What we checked</h3>
            <p className="text-sm text-muted-foreground">
              Four independent looks at your file — no single score decides everything.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {p9.evidenceAxisCards.map((card) => {
              const ui = AXIS_UI[axisUiKey(card.axis_name)]
              const tone = statusTone(card)
              const Icon = ui.icon
              return (
                <Card key={card.axis_name} className="border-border/50 bg-card/70 hover:bg-card/90 transition-colors">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium leading-tight">{ui.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{ui.subtitle}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px] shrink-0", tone.className)}>
                        {tone.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{card.user_text}</p>
                    {card.score_text && (
                      <p className="text-xs text-muted-foreground/80 border-t border-border/40 pt-2">
                        {humanizeScoreText(card.score_text)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Score bars — simplified for Phase 9 */}
      {!isErrorState && isPhase9 && (
        <Card className="border-border/50 bg-card/70">
          <CardContent className="p-5 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Signal strength at a glance</h3>
              <p className="text-sm text-muted-foreground">
                Higher bars mean stronger indicators on that check — they are guides, not proof.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {PHASE9_CHECKS.map(({ key, label, hint }) => (
                <ScoreBar key={key} label={label} hint={hint} value={result.details[key]} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Segment table */}
      {!isErrorState && isPhase9 && p9?.segmentRows && p9.segmentRows.length > 0 && (
        <Card className="border-border/50 bg-card/70">
          <CardContent className="p-5 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Moments to replay</h3>
              <p className="text-sm text-muted-foreground">
                Jump to these timestamps if you want to verify by ear.
              </p>
            </div>
            <div className="space-y-2">
              {p9.segmentRows.map((row) => (
                <div
                  key={row.rank}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/40 bg-muted/20 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-200 text-xs font-medium flex items-center justify-center">
                      {row.rank}
                    </span>
                    <div>
                      <p className="text-sm font-medium font-mono">{row.range}</p>
                      <p className="text-xs text-muted-foreground">{row.note}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">{row.score}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isPhase9 && p9?.safetyWording && (
        <p className="text-xs text-muted-foreground/80 leading-relaxed px-1">{p9.safetyWording}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <Button onClick={onNewAnalysis} size="lg" className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          Scan another file
        </Button>
        <Button variant="outline" size="lg" className="flex-1" asChild>
          <Link href="/profile">
            <History className="w-4 h-4 mr-2" />
            Past scans
          </Link>
        </Button>
      </div>
    </div>
  )
}

function simplifyVoiceOrigin(text: string): string {
  return text
    .replace(/^Voice origin:\s*/i, "")
    .replace(/likely human/i, "Sounds human-made")
    .replace(/likely ai[- ]generated/i, "May be AI-generated")
    .replace(/inconclusive/i, "Needs human review")
}

function humanizeScoreText(raw: string): string {
  return raw
    .replace(/uncalibrated model score/gi, "Raw model reading")
    .replace(/evidence strength/gi, "Signal level")
    .replace(/raw/gi, "uncalibrated")
}

function MetaPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-3 py-1.5">
      <Icon className="w-3.5 h-3.5 text-primary/80" />
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  )
}

function ScoreBar({ label, hint, value }: { label: string; hint: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, value))
  const barColor =
    clamped >= 70 ? "bg-orange-400" : clamped >= 40 ? "bg-amber-400" : "bg-emerald-400/80"

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs tabular-nums text-muted-foreground">{clamped}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${clamped}%` }} />
      </div>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  )
}
