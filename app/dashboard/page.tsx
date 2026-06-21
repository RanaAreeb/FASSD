"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { UploadZone } from "@/components/upload-zone"
import { DetectionResults } from "@/components/detection-results"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { AnalysisProcessing } from "@/components/analysis-processing"
import { saveAudioAnalysis, getAudioHistory, type AudioAnalysis } from "@/lib/firestore"
import { createEmptyDetectionResult, type DetectionResult } from "@/lib/detection-types"
import { inferenceFetchErrorMessage } from "@/lib/inference-url"
import { mapInferenceResponse } from "@/lib/inference-response-mapper"
import { postAnalyze, readInferenceError } from "@/lib/inference-client"
import { Radar } from "lucide-react"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [processingStep, setProcessingStep] = useState("")
  const [history, setHistory] = useState<AudioAnalysis[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [sessionCount, setSessionCount] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [lastProcessingTime, setLastProcessingTime] = useState<number | undefined>()

  useEffect(() => {
    if (!user?.uid) {
      setHistory([])
      setHistoryLoading(false)
      return
    }
    setHistoryLoading(true)
    getAudioHistory(user.uid)
      .then(setHistory)
      .finally(() => setHistoryLoading(false))
  }, [user?.uid, sessionCount])

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)
    setResult(null)
    setUploadedFile(file)

    try {
      setProcessingStep("Sending your file for analysis…")

      const t0 = performance.now()
      const resp = await postAnalyze(file)
      const t1 = performance.now()

      if (!resp.ok) {
        throw new Error(await readInferenceError(resp))
      }

      setProcessingStep("Putting together your results…")
      const data = await resp.json()
      const processingTime =
        typeof data?.processing_time_s === "number"
          ? data.processing_time_s
          : Number(((t1 - t0) / 1000).toFixed(2))

      const analysisResult = mapInferenceResponse(data, file, processingTime)

      if (user?.uid) {
        try {
          await saveAudioAnalysis(user.uid, {
            filename: analysisResult.filename,
            fileSize: analysisResult.fileSize,
            duration: analysisResult.duration,
            isDeepfake: analysisResult.isDeepfake,
            confidence: analysisResult.confidence,
            attackType: analysisResult.attackType,
            processingTime: analysisResult.processingTime,
            details: analysisResult.details,
            caseId:
              analysisResult.phase9?.caseId ??
              analysisResult.phase9?.reports?.caseId,
            backend: analysisResult.backend,
            reportPayload: analysisResult.reportPayload,
          })
        } catch (saveError) {
          console.error("Failed to save analysis to Firestore:", saveError)
        }
      }

      setSessionCount((c) => c + 1)
      setLastProcessingTime(processingTime)
      setResult(analysisResult)
    } catch (e) {
      console.error(e)
      setResult({
        ...createEmptyDetectionResult(),
        filename: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        isDeepfake: false,
        confidence: 0,
        attackType: "Error",
        overallExplanation: inferenceFetchErrorMessage(e),
        duration: "—",
        processingTime: 0,
      })
    } finally {
      setIsProcessing(false)
      setProcessingStep("")
    }
  }

  const handleNewAnalysis = () => {
    setResult(null)
    setUploadedFile(null)
    setIsProcessing(false)
    setProcessingStep("")
  }

  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.7 0.25 260 / 0.12) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.7 0.25 260 / 0.12) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 animate-float-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-morphism border-glow mb-4">
            <Radar className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
              Voice integrity lab
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gradient-primary leading-tight">
            Understand your audio in seconds
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl text-sm sm:text-base leading-relaxed">
            Upload a recording and we run four focused checks — voice source, replay signs, channel effects, and
            edited segments — then show you a clear waveform with anything worth replaying marked on the timeline.
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <aside className="lg:col-span-4 order-2 lg:order-1">
            <DashboardSidebar
              history={history}
              historyLoading={historyLoading}
              sessionCount={sessionCount}
              lastProcessingTime={lastProcessingTime}
            />
          </aside>

          <main className="lg:col-span-8 space-y-6 order-1 lg:order-2">
            {!result && !isProcessing && <UploadZone onFileUpload={handleFileUpload} isProcessing={isProcessing} />}
            {isProcessing && (
              <AnalysisProcessing stepLabel={processingStep || "Processing…"} audioFile={uploadedFile} />
            )}
            {result && (
              <DetectionResults result={result} audioFile={uploadedFile} onNewAnalysis={handleNewAnalysis} />
            )}
          </main>
        </div>
      </div>
    </section>
  )
}
