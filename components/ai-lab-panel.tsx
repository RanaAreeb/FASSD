"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, Wand2 } from "lucide-react"
import { generateDeepgramSpeech } from "@/lib/deepgram-client"
import { mixHumanWithAiSegment } from "@/lib/audio-mixer"
import { readAudioDuration } from "@/lib/upload-limits"
import { fetchTestSampleAsFile, TEST_AUDIO_SAMPLES } from "@/lib/test-audio-samples"

/** Target length for lab TTS — real speech, no silence padding. */
export const AI_LAB_MIN_DURATION_SECONDS = 60

const DEFAULT_AI_LAB_PROMPT = `This is a synthetic voice sample created for forensic screening and voice-integrity laboratory practice. I am generating this audio using text-to-speech so researchers can compare model behavior against known synthetic speech. The purpose is educational demonstration only, not legal proof of authenticity or deception. I will continue speaking at a natural conversational pace with clear articulation, steady volume, and neutral tone throughout this entire passage.

Forensic audio screening looks for acoustic cues such as unnatural pauses, spectral artifacts, repeated phrasing, and boundary discontinuities where segments may have been edited or spliced together. Real human recordings often contain small breath sounds, slight pitch variation, and room ambience that synthetic systems may smooth or omit entirely. In a controlled lab setting, analysts may blend synthetic segments into human speech to simulate partial fabrication and test whether detection tools flag only the inserted region or mislabel the entire file.

This sample is intentionally long so segment-level analysis has enough time windows to produce meaningful scores. Screening outputs remain probabilistic estimates and can be inconclusive when audio quality is poor, background noise is present, or the recording is heavily compressed. Always combine automated scores with careful manual listening, contextual review, and chain-of-custody documentation when handling sensitive material.`

interface AiLabPanelProps {
  onFileReady: (file: File) => void
  disabled?: boolean
}

function formatDuration(seconds: number): string {
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${mins}m ${secs}s`
  }
  return `${seconds.toFixed(1)}s`
}

export function AiLabPanel({ onFileReady, disabled }: AiLabPanelProps) {
  const [prompt, setPrompt] = useState(DEFAULT_AI_LAB_PROMPT)
  const [humanFile, setHumanFile] = useState<File | null>(null)
  const [aiFile, setAiFile] = useState<File | null>(null)
  const [aiDuration, setAiDuration] = useState<number | null>(null)
  const [insertAtSec, setInsertAtSec] = useState("2")
  const [busy, setBusy] = useState<"tts" | "mix" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loadingDefaultHuman, setLoadingDefaultHuman] = useState(false)

  const defaultHumanSample = useMemo(
    () => TEST_AUDIO_SAMPLES.find((sample) => sample.id === "human-clean-001") ?? null,
    [],
  )

  const aiLongEnough = aiDuration != null && aiDuration >= AI_LAB_MIN_DURATION_SECONDS

  useEffect(() => {
    let cancelled = false
    if (!defaultHumanSample || humanFile) return

    setLoadingDefaultHuman(true)
    fetchTestSampleAsFile(defaultHumanSample)
      .then((file) => {
        if (cancelled) return
        setHumanFile(file)
        setStatus((prev) => prev ?? `Default human base loaded: ${file.name}`)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Could not load default human sample.")
      })
      .finally(() => {
        if (!cancelled) setLoadingDefaultHuman(false)
      })

    return () => {
      cancelled = true
    }
  }, [defaultHumanSample, humanFile])

  const handleUseDefaultHuman = async () => {
    if (!defaultHumanSample) return
    setLoadingDefaultHuman(true)
    setError(null)
    try {
      const file = await fetchTestSampleAsFile(defaultHumanSample)
      setHumanFile(file)
      setStatus(`Human base loaded: ${file.name}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load default human sample.")
    } finally {
      setLoadingDefaultHuman(false)
    }
  }

  const handleGenerate = async () => {
    setBusy("tts")
    setError(null)
    setStatus(null)
    setAiFile(null)
    setAiDuration(null)
    try {
      const file = await generateDeepgramSpeech({ text: prompt })
      const duration = await readAudioDuration(file)
      setAiFile(file)
      setAiDuration(duration)

      if (duration == null) {
        setStatus(`Generated AI audio (${(file.size / 1024).toFixed(0)} KB). Duration could not be measured — try analyzing or add more text.`)
        return
      }

      if (duration < AI_LAB_MIN_DURATION_SECONDS) {
        setError(
          `Generated audio is only ${formatDuration(duration)}. Add more text — aim for at least ${AI_LAB_MIN_DURATION_SECONDS} seconds (~150+ words) of speech.`,
        )
        return
      }

      setStatus(
        `Generated AI audio (${formatDuration(duration)}, ${(file.size / 1024).toFixed(0)} KB). Ready to analyze or mix.`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate AI audio.")
    } finally {
      setBusy(null)
    }
  }

  const handleAnalyzeAi = () => {
    if (!aiFile) return
    if (!aiLongEnough) {
      setError(
        `Audio must be at least ${AI_LAB_MIN_DURATION_SECONDS} seconds. Generate again with a longer paragraph.`,
      )
      return
    }
    setError(null)
    onFileReady(aiFile)
  }

  const handleMix = async () => {
    if (!humanFile || !aiFile) {
      setError("Select a human recording and generate AI audio first.")
      return
    }
    if (!aiLongEnough) {
      setError(`Generate at least ${AI_LAB_MIN_DURATION_SECONDS}s of AI speech before mixing.`)
      return
    }
    setBusy("mix")
    setError(null)
    setStatus(null)
    try {
      const at = Number(insertAtSec)
      const mixed = await mixHumanWithAiSegment(humanFile, aiFile, Number.isFinite(at) ? at : 2)
      const duration = await readAudioDuration(mixed)
      if (duration != null && duration < AI_LAB_MIN_DURATION_SECONDS) {
        setError(
          `Mixed audio is only ${formatDuration(duration)}. Use a human recording that is at least ${AI_LAB_MIN_DURATION_SECONDS} seconds long.`,
        )
        return
      }
      setStatus("Mixed human + AI segment created. Ready to analyze.")
      onFileReady(mixed)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mix audio.")
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-5 text-left">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
        Generate synthetic speech with Deepgram for lab testing only. Use a full paragraph (about one minute when read
        aloud). Results are screening estimates — not legal proof.
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="deepgram-prompt">AI speech text</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px]"
            disabled={disabled || !!busy}
            onClick={() => setPrompt(DEFAULT_AI_LAB_PROMPT)}
          >
            Reset default text
          </Button>
        </div>
        <Textarea
          id="deepgram-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={disabled || !!busy}
          maxLength={2000}
          rows={10}
          className="text-sm leading-relaxed resize-y min-h-[180px]"
        />
        <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <p>
            Type or paste your own script. Target at least {AI_LAB_MIN_DURATION_SECONDS} seconds (~150+ words). No
            silence is added.
          </p>
          <span className="font-mono shrink-0">{prompt.length}/2000</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleGenerate} disabled={disabled || !!busy || !prompt.trim()}>
          {busy === "tts" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Generate AI audio
        </Button>
        <Button type="button" variant="outline" onClick={handleAnalyzeAi} disabled={disabled || !aiFile || !aiLongEnough}>
          Analyze AI clip
        </Button>
      </div>

      {aiFile && (
        <Badge variant="outline" className="font-mono text-[10px]">
          AI ready: {aiFile.name}
          {aiDuration != null ? ` · ${formatDuration(aiDuration)}` : ""}
        </Badge>
      )}

      <div className="border-t border-border/40 pt-4 space-y-3">
        <p className="text-sm font-medium">Mixer — human + fabricated segment</p>
        <p className="text-xs text-muted-foreground">
          Insert the generated AI segment into a human recording to simulate partial fabrication. Human clip should also
          be at least {AI_LAB_MIN_DURATION_SECONDS} seconds.
        </p>
        <div className="space-y-2">
          <Label htmlFor="human-mix-file">Human recording</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || !!busy || loadingDefaultHuman || !defaultHumanSample}
              onClick={handleUseDefaultHuman}
            >
              {loadingDefaultHuman ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Loading default human...
                </>
              ) : (
                <>Use built-in Human_001.wav</>
              )}
            </Button>
            {humanFile && (
              <Badge variant="outline" className="text-[10px] font-mono">
                Human ready: {humanFile.name}
              </Badge>
            )}
          </div>
          <Input
            id="human-mix-file"
            type="file"
            accept="audio/*,.wav,.mp3,.m4a,.webm"
            disabled={disabled || !!busy}
            onChange={(e) => setHumanFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="insert-sec">Insert AI at (seconds)</Label>
          <Input
            id="insert-sec"
            type="number"
            min={0}
            step={0.5}
            value={insertAtSec}
            onChange={(e) => setInsertAtSec(e.target.value)}
            disabled={disabled || !!busy}
          />
        </div>
        <Button type="button" variant="secondary" onClick={handleMix} disabled={disabled || !!busy || !humanFile || !aiFile}>
          {busy === "mix" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
          Create mixed audio & analyze
        </Button>
      </div>

      {status && <p className="text-xs text-primary/90">{status}</p>}
      {error && <p className="text-xs text-red-300/90">{error}</p>}
    </div>
  )
}
