"use client"

import type React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AudioWaveformDisplay } from "@/components/audio-waveform-display"
import { cn } from "@/lib/utils"
import type { DetectionResult, EvidenceAxisCard } from "@/lib/detection-types"
import { downloadAnalysisReport } from "@/lib/inference-client"
import { AnalysisReportViewer } from "@/components/analysis-report-viewer"
import { FILE_VERDICT_LABELS, fileVerdictTag } from "@/lib/verdict-labels"
import { History, FileDown, FileJson, FileText, RotateCcw, XCircle } from "lucide-react"
import { useState } from "react"

interface DetectionResultsProps {
  result: DetectionResult
  audioFile?: File | null
  onNewAnalysis: () => void
}

const MAIN_RESULT_BORDER: Record<string, string> = {
  review: "border-l-orange-400",
  clear_candidate: "border-l-amber-400",
  clear: "border-l-emerald-400",
  unavailable: "border-l-slate-500",
}

const EVIDENCE_CARD_BORDER: Record<string, string> = {
  Detected: "border-orange-400/70",
  "Review candidate": "border-amber-400/70",
  "Possible overlap": "border-amber-400/70",
  "Not detected": "border-emerald-400/50",
  Unavailable: "border-slate-500/50",
}

export function DetectionResults({ result, audioFile, onNewAnalysis }: DetectionResultsProps) {
  const isPhase9 = result.backend === "phase9" && !!result.phase9
  const p9 = result.phase9
  const isErrorState = result.attackType === "Error"

  if (isPhase9 && p9 && !isErrorState) {
    return (
      <Phase9DetectionResults
        result={result}
        audioFile={audioFile}
        onNewAnalysis={onNewAnalysis}
      />
    )
  }

  return (
    <LegacyDetectionResults
      result={result}
      audioFile={audioFile}
      onNewAnalysis={onNewAnalysis}
      isErrorState={isErrorState}
    />
  )
}

function Phase9DetectionResults({
  result,
  audioFile,
  onNewAnalysis,
}: DetectionResultsProps) {
  const p9 = result.phase9!
  const [reportError, setReportError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<"pdf" | "json" | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const caseId = p9.reports?.caseId ?? p9.caseId
  const severity = p9.severityLevel ?? "clear"
  const highlights = p9.segmentHighlights?.map((s) => ({
    startSec: s.startSec,
    endSec: s.endSec,
    rank: s.rank,
    label: s.label,
  }))
  const durationLabel =
    typeof p9.durationSec === "number" ? `${p9.durationSec.toFixed(1)} s` : result.duration

  const handleDownload = async (kind: "pdf" | "json") => {
    if (!caseId) {
      setReportError("Report is not ready yet — case ID missing.")
      return
    }
    setReportError(null)
    setDownloading(kind)
    try {
      await downloadAnalysisReport(caseId, kind)
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Could not download report.")
    } finally {
      setDownloading(null)
    }
  }

  const canDownload = !!caseId

  return (
    <div className="space-y-5 animate-float-up">
      <Card className={cn("border-border/60 bg-card/90 border-l-4", MAIN_RESULT_BORDER[severity] ?? MAIN_RESULT_BORDER.clear)}>
        <CardContent className="p-6 sm:p-7 space-y-3">
          <p className="text-sm text-muted-foreground">{p9.statusTitle ?? "Analysis completed"}</p>
          <h2 className="text-xl sm:text-2xl font-bold leading-snug text-foreground">
            {p9.voiceOriginText}
          </h2>
          {p9.forensicIndicatorSummary && (
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {p9.forensicIndicatorSummary}
            </p>
          )}
          {p9.highlightedSegmentText && (
            <p className="text-sm text-muted-foreground leading-relaxed">{p9.highlightedSegmentText}</p>
          )}
          {p9.recommendation && (
            <p className="text-sm sm:text-base text-foreground leading-relaxed">
              <span className="font-semibold">Recommendation: </span>
              {p9.recommendation}
            </p>
          )}
          {p9.confidenceText && (
            <p className="text-sm text-muted-foreground">{p9.confidenceText}</p>
          )}
        </CardContent>
      </Card>

      <div>
        <h3 className="text-sm font-semibold mb-3">Audio overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <OverviewCell label="File" value={result.filename} wide />
          <OverviewCell label="Duration" value={durationLabel} />
          <OverviewCell label="Analysis status" value={p9.processingStatus ?? "ok"} />
          <OverviewCell label="Manual review" value={p9.manualReviewRequired ? "yes" : "no"} />
          <OverviewCell label="Case ID" value={p9.caseId ?? "—"} wide />
        </div>
      </div>

      <Card className="overflow-hidden border-border/60 bg-card/80">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-muted-foreground">Waveform</p>
            {highlights && highlights.length > 0 && (
              <span className="text-[10px] text-amber-200/90">
                {highlights.length} highlighted region{highlights.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <AudioWaveformDisplay file={audioFile ?? null} highlights={highlights} height={128} />
        </CardContent>
      </Card>

      {p9.evidenceAxisCards.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Evidence indicators</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {p9.evidenceAxisCards.map((card) => (
              <EvidenceIndicatorCard key={card.axis_name} card={card} />
            ))}
          </div>
        </div>
      )}

      {p9.segmentRows && p9.segmentRows.length > 0 && (
        <Card className="border-border/50 bg-card/70">
          <CardContent className="p-5 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Candidate segments</h3>
              <p className="text-sm text-muted-foreground">Timestamps for optional manual listening.</p>
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

      {p9.safetyWording && (
        <p className="text-xs text-muted-foreground/80 leading-relaxed px-1">{p9.safetyWording}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1" onClick={() => setReportOpen(true)}>
          <FileText className="w-4 h-4 mr-2" />
          View full report
        </Button>
        {canDownload && (
          <>
            <Button
              variant="outline"
              className="flex-1"
              disabled={!!downloading}
              onClick={() => handleDownload("pdf")}
            >
              <FileDown className="w-4 h-4 mr-2" />
              {downloading === "pdf" ? "Preparing PDF…" : "Download PDF"}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={!!downloading}
              onClick={() => handleDownload("json")}
            >
              <FileJson className="w-4 h-4 mr-2" />
              {downloading === "json" ? "Preparing JSON…" : "Download JSON"}
            </Button>
          </>
        )}
      </div>

      <AnalysisReportViewer
        open={reportOpen}
        onOpenChange={setReportOpen}
        result={result}
        filename={result.filename}
      />

      {reportError && (
        <p className="text-sm text-red-300/90 leading-relaxed px-1">{reportError}</p>
      )}

      <ActionButtons onNewAnalysis={onNewAnalysis} />
    </div>
  )
}

function EvidenceIndicatorCard({ card }: { card: EvidenceAxisCard }) {
  const status = card.status || "Unavailable"
  const border = EVIDENCE_CARD_BORDER[status] ?? "border-border/60"

  return (
    <Card className={cn("bg-card/80 border-2", border)}>
      <CardContent className="p-4 sm:p-5 space-y-2">
        <p className="font-semibold text-foreground">{card.axis_name}</p>
        <p className="text-sm font-medium text-muted-foreground">{status}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{card.user_text}</p>
        {card.score_text && (
          <p className="text-xs text-muted-foreground/90 pt-1 border-t border-border/40">{card.score_text}</p>
        )}
      </CardContent>
    </Card>
  )
}

function OverviewCell({
  label,
  value,
  wide,
}: {
  label: string
  value: string
  wide?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-card/70 px-3 py-3 min-h-[72px]",
        wide && "col-span-2 sm:col-span-1 lg:col-span-1",
      )}
    >
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium break-all leading-snug">{value}</p>
    </div>
  )
}

function LegacyDetectionResults({
  result,
  audioFile,
  onNewAnalysis,
  isErrorState,
}: DetectionResultsProps & { isErrorState: boolean }) {
  const tag = isErrorState ? "error" : fileVerdictTag(result.isDeepfake)
  const copy = FILE_VERDICT_LABELS[tag]

  return (
    <div className="space-y-5 animate-float-up">
      {!isErrorState && (
        <Card className="overflow-hidden border-border/60 bg-card/80">
          <CardContent className="p-4 sm:p-5">
            <AudioWaveformDisplay file={audioFile ?? null} height={128} />
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60 bg-card/90">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold">{copy.title}</h2>
          <p className="mt-2 text-muted-foreground">{result.overallExplanation ?? copy.description}</p>
        </CardContent>
      </Card>

      {isErrorState && result.overallExplanation && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 text-sm text-red-100/90 leading-relaxed flex gap-2">
            <XCircle className="w-5 h-5 shrink-0" />
            {result.overallExplanation}
          </CardContent>
        </Card>
      )}

      <ActionButtons onNewAnalysis={onNewAnalysis} />
    </div>
  )
}

function ActionButtons({ onNewAnalysis }: { onNewAnalysis: () => void }) {
  return (
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
  )
}
