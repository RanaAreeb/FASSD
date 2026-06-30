"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AudioLines, FileUp, FlaskConical, Mic, Shield, TestTube2, type LucideIcon } from "lucide-react"
import { validateAudioFileForUpload } from "@/lib/upload-limits"
import { FORENSIC_DISCLAIMER } from "@/lib/copy-safety"
import { AudioRecorder } from "@/components/audio-recorder"
import { TestSamplesPanel } from "@/components/test-samples-panel"
import { AiLabPanel } from "@/components/ai-lab-panel"

interface UploadZoneProps {
  onFileUpload: (file: File) => void
  isProcessing: boolean
}

const FORMATS = ["WAV", "MP3", "FLAC", "M4A", "OGG", "AMR", "3GP", "WEBM"]

type SpecimenTabId = "upload" | "record" | "samples" | "lab"

const SPECIMEN_TABS: {
  value: SpecimenTabId
  label: string
  shortLabel: string
  icon: LucideIcon
  pill: string
  panelAccent: string
}[] = [
  {
    value: "upload",
    label: "Upload",
    shortLabel: "Upload file",
    icon: FileUp,
    pill:
      "bg-sky-500/15 text-sky-950 border-sky-600/45 shadow-sm " +
      "dark:bg-sky-500/25 dark:text-sky-200 dark:border-sky-400/60 dark:shadow-[0_0_12px_rgba(56,189,248,0.35)]",
    panelAccent: "border-sky-500/35 bg-sky-500/8 dark:border-sky-500/30 dark:bg-sky-500/5",
  },
  {
    value: "record",
    label: "Record",
    shortLabel: "Live recording",
    icon: Mic,
    pill:
      "bg-emerald-500/15 text-emerald-950 border-emerald-600/45 shadow-sm " +
      "dark:bg-emerald-500/25 dark:text-emerald-200 dark:border-emerald-400/60 dark:shadow-[0_0_12px_rgba(52,211,153,0.35)]",
    panelAccent: "border-emerald-500/35 bg-emerald-500/8 dark:border-emerald-500/30 dark:bg-emerald-500/5",
  },
  {
    value: "samples",
    label: "Test clips",
    shortLabel: "Bundled samples",
    icon: TestTube2,
    pill:
      "bg-violet-500/15 text-violet-950 border-violet-600/45 shadow-sm " +
      "dark:bg-violet-500/25 dark:text-violet-200 dark:border-violet-400/60 dark:shadow-[0_0_12px_rgba(167,139,250,0.35)]",
    panelAccent: "border-violet-500/35 bg-violet-500/8 dark:border-violet-500/30 dark:bg-violet-500/5",
  },
  {
    value: "lab",
    label: "AI lab",
    shortLabel: "AI generation",
    icon: FlaskConical,
    pill:
      "bg-amber-500/15 text-amber-950 border-amber-600/45 shadow-sm " +
      "dark:bg-amber-500/25 dark:text-amber-200 dark:border-amber-400/60 dark:shadow-[0_0_12px_rgba(251,191,36,0.35)]",
    panelAccent: "border-amber-500/35 bg-amber-500/8 dark:border-amber-500/30 dark:bg-amber-500/5",
  },
]

const SPECIMEN_TAB_TRIGGER =
  "text-xs sm:text-sm rounded-full py-2.5 px-3 font-medium transition-all duration-200 border border-transparent " +
  "text-muted-foreground hover:text-foreground hover:bg-muted/40 " +
  "data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-inherit"

function activeSpecimenTab(tabId: string) {
  return SPECIMEN_TABS.find((t) => t.value === tabId) ?? SPECIMEN_TABS[0]
}

export function UploadZone({ onFileUpload, isProcessing }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<SpecimenTabId>("upload")
  const currentTab = activeSpecimenTab(activeTab)
  const CurrentIcon = currentTab.icon

  const handleFile = useCallback(
    async (file: File) => {
      const validationError = await validateAudioFileForUpload(file)
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
      const audioFile = files.find(
        (f) => f.type.startsWith("audio/") || /\.(wav|mp3|flac|m4a|ogg|aac|webm|amr|3gp|3gpp)$/i.test(f.name),
      )
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
        className={`relative glass-morphism border-glow rounded-2xl p-6 sm:p-8 text-center space-y-6 ${
          isDragOver ? "border-primary/70 bg-primary/5" : ""
        }`}
      >
        <div className="space-y-2 max-w-lg mx-auto">
          <h3 className="text-2xl font-orbitron font-bold tracking-tight">Submit audio specimen</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Upload, record yourself, try bundled test clips, or generate AI speech for lab testing.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SpecimenTabId)} className="w-full text-left">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-2 p-2 bg-muted/30 border border-border/50 rounded-2xl">
            {SPECIMEN_TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.value
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`${SPECIMEN_TAB_TRIGGER} ${isActive ? `${tab.pill} font-semibold` : ""}`}
                >
                  <Icon className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <div
            className={`mt-5 rounded-xl border p-4 sm:p-5 transition-colors duration-300 ${currentTab.panelAccent}`}
          >
            <div className="flex justify-center sm:justify-start mb-4">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide ${currentTab.pill}`}
              >
                <CurrentIcon className="w-3.5 h-3.5 shrink-0" />
                You are in: {currentTab.shortLabel}
              </span>
            </div>

          <TabsContent value="upload" className="mt-0 space-y-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <FileUp className="w-7 h-7 text-primary" strokeWidth={1.5} />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {FORMATS.map((fmt) => (
                <Badge key={fmt} variant="outline" className="font-mono text-[10px] border-border/60">
                  {fmt}
                </Badge>
              ))}
            </div>

            <div className="flex justify-center">
              <input
                type="file"
                accept="audio/*,.wav,.mp3,.flac,.m4a,.ogg,.aac,.webm,.amr,.3gp,.3gpp"
                onChange={handleFileSelect}
                className="hidden"
                id="audio-upload"
                disabled={isProcessing}
              />
              <label htmlFor="audio-upload">
                <Button size="lg" className="btn-professional glow-effect font-orbitron tracking-wide px-8 cursor-pointer" disabled={isProcessing} asChild>
                  <span>
                    <AudioLines className="w-4 h-4 mr-2 inline" />
                    Select audio file
                  </span>
                </Button>
              </label>
            </div>
          </TabsContent>

          <TabsContent value="record" className="mt-0">
            <AudioRecorder onRecorded={handleFile} disabled={isProcessing} />
          </TabsContent>

          <TabsContent value="samples" className="mt-0">
            <TestSamplesPanel onSampleSelected={handleFile} disabled={isProcessing} />
          </TabsContent>

          <TabsContent value="lab" className="mt-0">
            <AiLabPanel onFileReady={handleFile} disabled={isProcessing} />
          </TabsContent>
          </div>
        </Tabs>

        <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-primary/70" />
            {FORENSIC_DISCLAIMER}
          </span>
          <span>5s-5min · Max 50 MB · Human speech only (no animal/ringtone)</span>
        </div>

        {selectedName && !isProcessing && (
          <p className="text-xs font-mono text-primary/80 truncate max-w-sm mx-auto">Queued: {selectedName}</p>
        )}

        {uploadError && (
          <p className="text-xs text-red-700 dark:text-red-300/90 max-w-md mx-auto leading-relaxed">{uploadError}</p>
        )}
      </div>
    </div>
  )
}
