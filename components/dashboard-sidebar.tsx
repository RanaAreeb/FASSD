"use client"

import Link from "next/link"
import { Activity, Clock, FileAudio, ShieldAlert, ShieldCheck, History } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { AudioAnalysis } from "@/lib/firestore"
import { PHASE9_PIPELINE_STEPS, PIPELINE_SUBTITLE } from "@/lib/project-facts"

interface DashboardSidebarProps {
  history: AudioAnalysis[]
  historyLoading: boolean
  sessionCount: number
  lastProcessingTime?: number
}

export function DashboardSidebar({
  history,
  historyLoading,
  sessionCount,
  lastProcessingTime,
}: DashboardSidebarProps) {
  const total = history.length
  const spoofCount = history.filter((h) => h.isDeepfake).length
  const bonafideCount = total - spoofCount
  const avgTime =
    total > 0
      ? (history.reduce((sum, h) => sum + (h.processingTime ?? 0), 0) / total).toFixed(1)
      : null

  const runtimeDisplay =
    lastProcessingTime != null && sessionCount > 0
      ? `${lastProcessingTime}s`
      : avgTime
        ? `${avgTime}s`
        : "—"

  const stats = [
    {
      label: "Your scans",
      value: historyLoading ? "—" : String(total),
      sub: total === 0 ? "No saved history yet" : `${bonafideCount} clear · ${spoofCount} review suggested`,
      icon: FileAudio,
      accent: "text-primary",
    },
    {
      label: "This session",
      value: String(sessionCount),
      sub: sessionCount === 0 ? "Upload to begin" : "Analyses this visit",
      icon: Activity,
      accent: "text-chart-2",
    },
    {
      label: "Avg. runtime",
      value: runtimeDisplay,
      sub: avgTime ? `Historical mean: ${avgTime}s` : "From your saved runs",
      icon: Clock,
      accent: "text-chart-4",
    },
    {
      label: "Review suggested",
      value: historyLoading ? "—" : String(spoofCount),
      sub: total > 0 ? `${Math.round((spoofCount / total) * 100)}% of your library` : "Across saved analyses",
      icon: ShieldAlert,
      accent: "text-destructive",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="glass-morphism border-glow/50 relative overflow-hidden group hover:border-primary/40 transition-colors"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium truncate">
                    {s.label}
                  </p>
                  <p className="text-2xl font-orbitron font-bold tabular-nums">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">{s.sub}</p>
                </div>
                <s.icon className={`w-4 h-4 shrink-0 ${s.accent} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-morphism border-glow/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-orbitron tracking-wide">Analysis pipeline</CardTitle>
          </div>
          <CardDescription className="text-xs">{PIPELINE_SUBTITLE}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          {PHASE9_PIPELINE_STEPS.map((item) => (
            <div key={item.step} className="flex gap-3 py-2.5 border-b border-border/40 last:border-0">
              <span className="text-[10px] font-mono text-primary/80 w-5 pt-0.5">{item.step}</span>
              <div>
                <p className="text-sm font-medium leading-none">{item.label}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{item.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full glass-morphism border-glow/30 bg-transparent" asChild>
        <Link href="/profile">
          <History className="w-4 h-4 mr-2" />
          View analysis history
        </Link>
      </Button>
    </div>
  )
}
