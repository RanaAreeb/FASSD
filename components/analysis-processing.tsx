"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AudioWaveformDisplay } from "@/components/audio-waveform-display"
import { Layers, Mic2, ScanSearch, Sparkles, Waves } from "lucide-react"

const STEPS = [
  { id: "upload", label: "Receiving your file", icon: Mic2 },
  { id: "listen", label: "Listening to the waveform", icon: Waves },
  { id: "checks", label: "Running four integrity checks", icon: ScanSearch },
  { id: "segments", label: "Marking moments worth replaying", icon: Layers },
  { id: "report", label: "Preparing your summary", icon: Sparkles },
]

interface AnalysisProcessingProps {
  stepLabel: string
  audioFile?: File | null
}

export function AnalysisProcessing({ stepLabel, audioFile }: AnalysisProcessingProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % STEPS.length)
    }, 2200)
    return () => clearInterval(timer)
  }, [])

  return (
    <Card className="overflow-hidden border-border/60 bg-card/80 shadow-lg">
      <CardContent className="p-8 sm:p-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-8">
            <div className="space-y-3">
              <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5">
                Scanning
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">Reading your audio…</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{stepLabel}</p>
            </div>

            <div className="space-y-3">
              {STEPS.map((step, idx) => {
                const Icon = step.icon
                const isActive = idx === activeIndex
                const isDone = idx < activeIndex
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-500 ${
                      isActive
                        ? "border-primary/50 bg-primary/10"
                        : isDone
                          ? "border-border/30 bg-muted/20 opacity-80"
                          : "border-border/20 opacity-50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{step.label}</span>
                    {isActive && <span className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <AudioWaveformDisplay file={audioFile ?? null} height={140} />
            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              Voice source · replay · channel mix · edited segments
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
