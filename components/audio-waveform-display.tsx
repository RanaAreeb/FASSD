"use client"

import { useEffect, useRef, useState } from "react"
import { extractAudioPeaks } from "@/lib/extract-audio-peaks"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export type WaveformHighlight = {
  startSec: number
  endSec: number
  label?: string
  rank?: number
}

interface AudioWaveformDisplayProps {
  file: File | null
  highlights?: WaveformHighlight[]
  className?: string
  height?: number
}

export function AudioWaveformDisplay({
  file,
  highlights = [],
  className,
  height = 120,
}: AudioWaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!file) return

    let cancelled = false
    setLoading(true)
    setError(null)

    extractAudioPeaks(file)
      .then(({ peaks, duration: dur }) => {
        if (cancelled) return
        setDuration(dur)
        drawWaveform(canvasRef.current, peaks, dur, highlights, height)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Could not read audio waveform")
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [file, highlights, height])

  useEffect(() => {
    const onResize = () => {
      if (!file || loading || error) return
      extractAudioPeaks(file).then(({ peaks, duration: dur }) => {
        drawWaveform(canvasRef.current, peaks, dur, highlights, height)
      })
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [file, highlights, height, loading, error])

  if (!file) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-border/60 bg-muted/20 flex items-center justify-center text-sm text-muted-foreground",
          className,
        )}
        style={{ height }}
      >
        No audio loaded
      </div>
    )
  }

  return (
    <div className={cn("relative rounded-2xl border border-border/50 bg-gradient-to-b from-muted/30 to-muted/10 overflow-hidden", className)}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-4 text-center text-sm text-muted-foreground">
          {error}
        </div>
      )}
      <canvas ref={canvasRef} className="w-full block" style={{ height }} />
      {duration > 0 && highlights.length > 0 && (
        <div className="absolute bottom-2 left-3 right-3 flex flex-wrap gap-2">
          {highlights.slice(0, 4).map((h, i) => (
            <span
              key={`${h.startSec}-${h.endSec}-${i}`}
              className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30"
            >
              {h.label ?? `Region ${h.rank ?? i + 1}`}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function drawWaveform(
  canvas: HTMLCanvasElement | null,
  peaks: number[],
  duration: number,
  highlights: WaveformHighlight[],
  height: number,
) {
  if (!canvas || peaks.length === 0) return

  const dpr = window.devicePixelRatio || 1
  const width = canvas.offsetWidth
  canvas.width = width * dpr
  canvas.height = height * dpr

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  const mid = height / 2
  const barW = width / peaks.length

  // Highlight bands behind waveform
  for (const h of highlights) {
    if (duration <= 0) continue
    const x0 = (h.startSec / duration) * width
    const x1 = (h.endSec / duration) * width
    ctx.fillStyle = "rgba(251, 191, 36, 0.18)"
    ctx.fillRect(x0, 0, Math.max(x1 - x0, 2), height)
    ctx.strokeStyle = "rgba(251, 191, 36, 0.55)"
    ctx.lineWidth = 1
    ctx.strokeRect(x0, 0, Math.max(x1 - x0, 2), height)
  }

  // Symmetric waveform bars
  for (let i = 0; i < peaks.length; i++) {
    const amp = peaks[i] * (height * 0.42)
    const x = i * barW
    const gradient = ctx.createLinearGradient(0, mid - amp, 0, mid + amp)
    gradient.addColorStop(0, "rgba(99, 102, 241, 0.95)")
    gradient.addColorStop(0.5, "rgba(129, 140, 248, 0.85)")
    gradient.addColorStop(1, "rgba(99, 102, 241, 0.5)")
    ctx.fillStyle = gradient
    ctx.fillRect(x + barW * 0.08, mid - amp, barW * 0.84, amp * 2)
  }

  // Baseline
  ctx.strokeStyle = "rgba(255,255,255,0.08)"
  ctx.beginPath()
  ctx.moveTo(0, mid)
  ctx.lineTo(width, mid)
  ctx.stroke()
}
