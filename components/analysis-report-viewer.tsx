"use client"

import { useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DetectionResult, EvidenceAxisCard } from "@/lib/detection-types"
import {
  buildReportViewModelFromPayload,
  buildReportViewModelFromPhase9,
  type ReportViewModel,
} from "@/lib/report-view-model"
import { downloadAnalysisReport } from "@/lib/inference-client"
import { softenForensicCopy, FORENSIC_DISCLAIMER } from "@/lib/copy-safety"
import { ChevronDown, ChevronUp, FileDown, FileJson, Loader2 } from "lucide-react"

const EVIDENCE_BORDER: Record<string, string> = {
  Detected: "border-orange-400/70",
  "Review candidate": "border-amber-400/70",
  "Possible overlap": "border-amber-400/70",
  "Not detected": "border-emerald-400/50",
  Unavailable: "border-slate-500/50",
}

interface AnalysisReportViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report?: ReportViewModel | null
  result?: DetectionResult | null
  payload?: Record<string, unknown> | null
  filename?: string
  loading?: boolean
  error?: string | null
}

export function AnalysisReportViewer({
  open,
  onOpenChange,
  report,
  result,
  payload,
  filename,
  loading = false,
  error = null,
}: AnalysisReportViewerProps) {
  const [showRawJson, setShowRawJson] = useState(false)
  const [downloading, setDownloading] = useState<"pdf" | "json" | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const viewModel = useMemo(() => {
    if (report) return report
    if (payload) {
      return buildReportViewModelFromPayload(payload, { filename, result })
    }
    if (result?.reportPayload) {
      return buildReportViewModelFromPayload(result.reportPayload, { filename, result })
    }
    if (result?.phase9) {
      return buildReportViewModelFromPhase9(result.phase9, filename ?? result.filename, result)
    }
    return null
  }, [report, payload, result, filename])

  const caseId = viewModel?.caseId && viewModel.caseId !== "—" ? viewModel.caseId : null

  const handleDownload = async (kind: "pdf" | "json") => {
    if (!caseId) {
      setDownloadError("Case ID missing — cannot download file.")
      return
    }
    setDownloadError(null)
    setDownloading(kind)
    try {
      await downloadAnalysisReport(caseId, kind)
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Download failed.")
    } finally {
      setDownloading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur z-10">
          <DialogTitle className="text-xl font-orbitron">Technical report & export</DialogTitle>
          <DialogDescription className="text-left">
            {viewModel?.filename ?? filename ?? "Same analysis as the summary — with technical metrics and raw JSON"}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading report…
            </div>
          )}

          {!loading && error && (
            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="p-4 text-sm text-red-200">{error}</CardContent>
            </Card>
          )}

          {!loading && !error && viewModel && (
            <>
              <Card className="border-l-4 border-l-primary bg-card/80">
                <CardContent className="p-5 space-y-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{softenForensicCopy(viewModel.statusTitle)}</p>
                  <h3 className="text-lg font-semibold leading-snug">{softenForensicCopy(viewModel.voiceOriginText)}</h3>
                  {viewModel.forensicIndicatorSummary && (
                    <p className="text-sm text-muted-foreground">{softenForensicCopy(viewModel.forensicIndicatorSummary)}</p>
                  )}
                  {viewModel.highlightedSegmentText && (
                    <p className="text-sm text-muted-foreground">{softenForensicCopy(viewModel.highlightedSegmentText)}</p>
                  )}
                  {viewModel.recommendation && (
                    <p className="text-sm">
                      <span className="font-semibold">Recommendation: </span>
                      {softenForensicCopy(viewModel.recommendation)}
                    </p>
                  )}
                  {viewModel.confidenceText && (
                    <p className="text-xs text-muted-foreground">{softenForensicCopy(viewModel.confidenceText)}</p>
                  )}
                </CardContent>
              </Card>

              <div>
                <h4 className="text-sm font-semibold mb-3">Audio overview</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <InfoTile label="Case ID" value={viewModel.caseId} />
                  <InfoTile label="Duration" value={viewModel.duration} />
                  <InfoTile label="Status" value={viewModel.processingStatus} />
                  <InfoTile label="Manual review" value={viewModel.manualReview} />
                  <InfoTile label="File" value={viewModel.filename} className="sm:col-span-2" />
                </div>
              </div>

              {viewModel.evidenceCards.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Evidence indicators</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {viewModel.evidenceCards.map((card) => (
                      <EvidenceCard key={card.axis_name} card={card} />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold mb-1">Axis screening scores</h4>
                <p className="text-[11px] text-muted-foreground mb-3">
                  Scores are capped at 96% max (never 100%). Evidence band matches the indicator cards and is not a final verdict.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {viewModel.axisMetrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3"
                    >
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                      <p className="text-lg font-mono font-semibold mt-1">{metric.probability}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">Evidence band: {metric.strength}</p>
                    </div>
                  ))}
                </div>
              </div>

              {viewModel.segmentRows.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Candidate segments</h4>
                  <div className="space-y-2">
                    {viewModel.segmentRows.map((row) => (
                      <div
                        key={`${row.rank}-${row.range}`}
                        className="flex justify-between gap-3 rounded-lg border border-border/50 bg-card/60 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-mono font-medium">
                            #{row.rank} · {row.range}
                          </p>
                          <p className="text-xs text-muted-foreground">{row.note}</p>
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">{row.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewModel.limitations.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Limitations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                    {viewModel.limitations.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {viewModel.safetyWording && (
                <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
                  {softenForensicCopy(viewModel.safetyWording)}
                </p>
              )}

              <p className="text-xs text-muted-foreground">{FORENSIC_DISCLAIMER}</p>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={!caseId || !!downloading}
                  onClick={() => handleDownload("pdf")}
                >
                  {downloading === "pdf" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4 mr-2" />
                  )}
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={!caseId || !!downloading}
                  onClick={() => handleDownload("json")}
                >
                  {downloading === "json" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileJson className="w-4 h-4 mr-2" />
                  )}
                  Download JSON
                </Button>
              </div>

              {downloadError && <p className="text-sm text-red-300/90">{downloadError}</p>}

              <div className="border border-border/50 rounded-lg overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium bg-muted/20 hover:bg-muted/30 transition-colors"
                  onClick={() => setShowRawJson((v) => !v)}
                >
                  Raw JSON data
                  {showRawJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showRawJson && (
                  <pre className="text-[11px] leading-relaxed p-4 overflow-x-auto bg-black/40 text-emerald-100/90 max-h-64">
                    {viewModel.rawJson}
                  </pre>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoTile({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={cn("rounded-lg border border-border/60 bg-card/70 px-3 py-3", className)}>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium break-all leading-snug">{value}</p>
    </div>
  )
}

function EvidenceCard({ card }: { card: EvidenceAxisCard }) {
  const status = card.status || "Unavailable"
  return (
    <div className={cn("rounded-lg border-2 bg-card/70 p-4", EVIDENCE_BORDER[status] ?? "border-border/60")}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-sm">{card.axis_name}</p>
        <Badge variant="outline" className="text-[10px] shrink-0">
          {status}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{softenForensicCopy(card.user_text)}</p>
      {card.score_text && (
        <p className="text-xs text-muted-foreground/90 mt-2 pt-2 border-t border-border/40">{card.score_text}</p>
      )}
    </div>
  )
}
