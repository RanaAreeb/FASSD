"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Play } from "lucide-react"
import { fetchTestSampleAsFile, TEST_AUDIO_SAMPLES } from "@/lib/test-audio-samples"

interface TestSamplesPanelProps {
  onSampleSelected: (file: File) => void
  disabled?: boolean
}

export function TestSamplesPanel({ onSampleSelected, disabled }: TestSamplesPanelProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLoad = async (id: string) => {
    const sample = TEST_AUDIO_SAMPLES.find((s) => s.id === id)
    if (!sample) return
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
        One-click samples from <span className="font-mono text-xs">/public/test</span> for FYP demos — human, AI,
        repeat, and mixed clips.
      </p>

      <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
        {categories.map((category) => (
          <div key={category} className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{category}</p>
            <div className="space-y-2">
              {TEST_AUDIO_SAMPLES.filter((s) => s.category === category).map((sample) => (
                <div
                  key={sample.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{sample.label}</p>
                    <p className="text-[11px] text-muted-foreground">{sample.hint}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={disabled || loadingId === sample.id}
                    onClick={() => handleLoad(sample.id)}
                  >
                    {loadingId === sample.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 mr-1" />
                        Use
                      </>
                    )}
                  </Button>
                </div>
              ))}
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
