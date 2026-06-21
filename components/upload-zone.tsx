"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AudioLines, FileUp, Shield } from "lucide-react"
import { validateAudioFile } from "@/lib/upload-limits"

interface UploadZoneProps {
  onFileUpload: (file: File) => void
  isProcessing: boolean
}

const FORMATS = ["WAV", "MP3", "FLAC", "M4A", "OGG"]

export function UploadZone({ onFileUpload, isProcessing }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateAudioFile(file)
      if (validationError) {
        setUploadError(validationError)
        setSelectedName(null)
        return
      }
      setUploadError(null)
      setSelectedName(file.name)
      onFileUpload(file)
    },
    [onFileUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const files = Array.from(e.dataTransfer.files)
      const audioFile = files.find((f) => f.type.startsWith("audio/") || /\.(wav|mp3|flac|m4a|ogg)$/i.test(f.name))
      if (audioFile) handleFile(audioFile)
    },
    [handleFile],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
      e.target.value = ""
    },
    [handleFile],
  )

  return (
    <div
      className={`group relative rounded-2xl transition-all duration-500 ${
        isDragOver ? "scale-[1.01]" : ""
      } ${isProcessing ? "opacity-60 pointer-events-none" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={`absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/40 via-chart-2/20 to-transparent opacity-0 transition-opacity duration-500 ${
          isDragOver ? "opacity-100" : "group-hover:opacity-60"
        }`}
      />
      <div
        className={`relative glass-morphism border-glow rounded-2xl p-8 sm:p-12 text-center space-y-8 ${
          isDragOver ? "border-primary/70 bg-primary/5" : ""
        }`}
      >
        <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-effect">
          <FileUp className="w-9 h-9 text-primary" strokeWidth={1.5} />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-2xl font-orbitron font-bold tracking-tight">Submit audio specimen</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Drop a recording for hybrid-model screening. Results include chunk-level voting, environmental cues, and
            explainable reasoning.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {FORMATS.map((fmt) => (
            <Badge key={fmt} variant="outline" className="font-mono text-[10px] border-border/60">
              {fmt}
            </Badge>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <input
            type="file"
            accept="audio/*,.wav,.mp3,.flac,.m4a,.ogg"
            onChange={handleFileSelect}
            className="hidden"
            id="audio-upload"
            disabled={isProcessing}
          />
          <label htmlFor="audio-upload">
            <Button
              size="lg"
              className="btn-professional glow-effect font-orbitron tracking-wide px-8 cursor-pointer"
              disabled={isProcessing}
              asChild
            >
              <span>
                <AudioLines className="w-4 h-4 mr-2 inline" />
                Select audio file
              </span>
            </Button>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-primary/70" />
            Screening estimate — not legal proof
          </span>
          <span>Max ~50 MB · Mono decode @ 16 kHz</span>
        </div>

        {selectedName && !isProcessing && (
          <p className="text-xs font-mono text-primary/80 truncate max-w-sm mx-auto">Queued: {selectedName}</p>
        )}

        {uploadError && (
          <p className="text-xs text-red-300/90 max-w-md mx-auto leading-relaxed">{uploadError}</p>
        )}
      </div>
    </div>
  )
}
