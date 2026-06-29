"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Loader2, Pause, Volume2 } from "lucide-react"
import { fetchTestSampleAsFile, testAudioFetchUrl, TEST_AUDIO_SAMPLES } from "@/lib/test-audio-samples"
import type { TestAudioSample } from "@/lib/test-audio-samples"

interface TestSamplesPanelProps {
  onSampleSelected: (file: File) => void
  disabled?: boolean
}

export function TestSamplesPanel({ onSampleSelected, disabled }: TestSamplesPanelProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current.onended = null
      audioRef.current.onerror = null
      audioRef.current = null
    }
    setPreviewingId(null)
  }

  const handleListen = async (sample: TestAudioSample) => {
    if (previewingId === sample.id) {
      stopPreview()
      return
    }

    stopPreview()
    setPreviewLoadingId(sample.id)
    setError(null)

    try {
      const audio = new Audio(testAudioFetchUrl(sample.path))
      audioRef.current = audio
      audio.onended = () => {
        setPreviewingId(null)
        audioRef.current = null
      }
      audio.onerror = () => {
        setError(`Could not play ${sample.label}. Check that the file is deployed.`)
        stopPreview()
      }
      await audio.play()
      setPreviewingId(sample.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not play ${sample.label}.`)
      stopPreview()
    } finally {
      setPreviewLoadingId(null)
    }
  }

  const handleLoad = async (id: string) => {
    const sample = TEST_AUDIO_SAMPLES.find((s) => s.id === id)
    if (!sample) return
    stopPreview()
    setLoadingId(id)
    setError(null)
    try {
      const file = await fetchTestSampleAsFile(sample)
      onSampleSelected(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load sample.")
    } finally {
      setLoadingId(null)
    }
  }

  const categories = [...new Set(TEST_AUDIO_SAMPLES.map((s) => s.category))]

  return (
    <div className="space-y-4 text-left">
      <p className="text-sm text-muted-foreground leading-relaxed">
        One-click samples from <span className="font-mono text-xs">/public/test</span> for FYP demos: human, AI,
        repeat, and mixed clips.
      </p>

      <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
        {categories.map((category) => (
          <div key={category} className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{category}</p>
            <div className="space-y-2">
              {TEST_AUDIO_SAMPLES.filter((s) => s.category === category).map((sample) => {
                const isPreviewing = previewingId === sample.id
                const isPreviewLoading = previewLoadingId === sample.id
                const isUsing = loadingId === sample.id

                return (
                  <div
                    key={sample.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{sample.label}</p>
                      <p className="text-[11px] text-muted-foreground">{sample.hint}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      <Button
                        type="button"
                        size="sm"
                        variant={isPreviewing ? "secondary" : "ghost"}
                        disabled={disabled || isPreviewLoading || isUsing}
                        onClick={() => handleListen(sample)}
                        className="h-8 px-2.5"
                      >
                        {isPreviewLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isPreviewing ? (
                          <>
                            <Pause className="w-3.5 h-3.5 mr-1" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 mr-1" />
                            Listen
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={disabled || isUsing || isPreviewLoading}
                        onClick={() => handleLoad(sample.id)}
                        className="h-8 px-2.5"
                      >
                        {isUsing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <ArrowRight className="w-3.5 h-3.5 mr-1" />
                            Use
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge key={category} variant="outline" className="text-[10px]">
            {category}
          </Badge>
        ))}
      </div>

      {error && <p className="text-xs text-red-300/90">{error}</p>}
    </div>
  )
}
