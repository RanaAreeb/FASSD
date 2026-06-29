import type { DetectionResult, EvidenceAxisCard, Phase9ResultView } from "@/lib/detection-types"
import type { AudioAnalysis } from "@/lib/firestore"
import { formatScreeningScore, formatScreeningScoreFromPercent } from "@/lib/copy-safety"
import {
  strengthLabelFromCard,
  evidenceStrengthFromProbability,
  isClearHumanAxisProfile,
  isPartialGateNotDetected,
  normalizeCardsForClearHuman,
} from "@/lib/forensic-consistency"

export interface ReportAxisMetric {
  label: string
  probability: string
  strength: string
}

export interface ReportSegmentRow {
  rank: string
  range: string
  score: string
  note: string
}

export interface ReportViewModel {
  filename: string
  caseId: string
  statusTitle: string
  voiceOriginText: string
  forensicIndicatorSummary: string
  highlightedSegmentText: string
  recommendation: string
  confidenceText: string
  duration: string
  processingStatus: string
  manualReview: string
  evidenceCards: EvidenceAxisCard[]
  segmentRows: ReportSegmentRow[]
  axisMetrics: ReportAxisMetric[]
  limitations: string[]
  safetyWording: string
  rawJson: string
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function fmtProb(value: unknown): string {
  return typeof value === "number" ? formatScreeningScore(value) : "—"
}

function fmtStrength(evidence: Record<string, unknown> | null, cards: EvidenceAxisCard[], needle: string): string {
  const fromCard = strengthLabelFromCard(cards, needle)
  if (fromCard !== "—") return fromCard
  const prob = evidence?.probability
  if (typeof prob === "number") return evidenceStrengthFromProbability(prob)
  if (!evidence) return "—"
  const raw = evidence.evidence_strength_band ?? evidence.evidence_strength ?? evidence.label
  if (typeof raw !== "string") return "—"
  const lower = raw.toLowerCase()
  if (lower.includes("high")) return "High evidence"
  if (lower.includes("moderate") || lower.includes("medium")) return "Moderate evidence"
  if (lower.includes("low")) return "Low evidence"
  if (lower.includes("borderline")) return "Borderline"
  return raw
}

export function buildReportViewModelFromPayload(
  payload: Record<string, unknown>,
  fallback?: { filename?: string; result?: DetectionResult | null },
): ReportViewModel {
  const p9 = fallback?.result?.phase9
  const summary = asRecord(payload.user_summary) ?? {}
  const voice = asRecord(payload.voice_origin_result) ?? {}
  const pf = asRecord(payload.partial_fabrication) ?? {}
  const report = asRecord(payload.phase9c_report) ?? {}
  const safety = asRecord(payload.safety) ?? {}

  const cards = (p9?.evidenceAxisCards?.length
    ? p9.evidenceAxisCards
    : Array.isArray(payload.evidence_axis_cards)
      ? payload.evidence_axis_cards
      : []) as EvidenceAxisCard[]

  const topSegments = Array.isArray(pf.top_segments) ? pf.top_segments : []
  const segmentRows: ReportSegmentRow[] =
    p9?.segmentRows?.map((row) => ({
      rank: String(row.rank),
      range: row.range,
      score: row.score,
      note: row.note,
    })) ??
    topSegments.slice(0, 10).map((seg, idx) => {
      const s = asRecord(seg) ?? {}
      const start = s.start_sec
      const end = s.end_sec
      const range =
        typeof start === "number" && typeof end === "number"
          ? `${Math.floor(start / 60)}:${String(Math.floor(start % 60)).padStart(2, "0")} – ${Math.floor(end / 60)}:${String(Math.floor(end % 60)).padStart(2, "0")}`
          : "—"
      return {
        rank: String(s.rank ?? idx + 1),
        range,
        score: fmtProb(s.probability),
        note: String(pf.segment_recommendation_label ?? "Worth a listen"),
      }
    })

  const origin = asRecord(report.origin_evidence)
  const replay = asRecord(report.replay_evidence)
  const mixer = asRecord(report.mixer_channel_evidence)
  const partial = asRecord(report.partial_fabrication_evidence)

  const durationSec =
    payload.duration_sec ??
    asRecord(report.audio_metadata)?.duration_sec ??
    p9?.durationSec

  const limitations = Array.isArray(payload.limitations)
    ? payload.limitations.map(String)
    : []

  const originProb = typeof origin?.probability === "number" ? origin.probability : null
  const replayProb = typeof replay?.probability === "number" ? replay.probability : null
  const mixerProb = typeof mixer?.probability === "number" ? mixer.probability : null
  const partialProb =
    typeof partial?.max_segment_probability === "number"
      ? partial.max_segment_probability
      : typeof partial?.probability === "number"
        ? partial.probability
        : null

  const clearHuman =
    originProb != null &&
    replayProb != null &&
    mixerProb != null &&
    partialProb != null &&
    isClearHumanAxisProfile(originProb, replayProb, mixerProb, partialProb, cards)

  const voiceOriginText = clearHuman
    ? "Voice origin: Likely human"
    : String(p9?.voiceOriginText ?? summary.voice_origin_text ?? voice.display_text ?? "—")

  const forensicIndicatorSummary = clearHuman
    ? "No strong manipulation indicators detected"
    : String(p9?.forensicIndicatorSummary ?? summary.forensic_indicator_summary ?? payload.forensic_indicator_summary ?? "")

  const recommendation = clearHuman
    ? "No urgent review suggested from screening scores."
    : String(p9?.recommendation ?? summary.recommendation_text ?? payload.recommendation ?? "")

  const confidenceText = clearHuman
    ? "Evidence strength: Low evidence"
    : String(p9?.confidenceText ?? summary.confidence_text ?? voice.confidence_text ?? "")

  const manualReview = clearHuman ? "no" : payload.manual_review_required === false ? "no" : "yes"

  const displayCards =
    clearHuman && originProb != null ? normalizeCardsForClearHuman(cards, originProb) : cards

  return {
    filename: String(payload.file_name ?? fallback?.filename ?? p9?.caseId ?? "Audio file"),
    caseId: String(payload.case_id ?? p9?.caseId ?? p9?.reports?.caseId ?? "—"),
    statusTitle: String(p9?.statusTitle ?? summary.status_title ?? "Analysis completed"),
    voiceOriginText,
    forensicIndicatorSummary,
    highlightedSegmentText: String(
      p9?.highlightedSegmentText !== undefined
        ? (p9.highlightedSegmentText ?? "")
        : clearHuman
          ? ""
          : summary.highlighted_segment_text ?? ""
    ),
    recommendation,
    confidenceText,
    duration: typeof durationSec === "number" ? `${durationSec.toFixed(1)} s` : fallback?.result?.duration ?? "—",
    processingStatus: String(p9?.processingStatus ?? payload.processing_status ?? "ok"),
    manualReview,
    evidenceCards: displayCards,
    segmentRows,
    axisMetrics: [
      {
        label: "AI-origin evidence",
        probability: fmtProb(origin?.probability),
        strength: fmtStrength(origin, displayCards, "AI-origin"),
      },
      {
        label: "Replay evidence",
        probability: fmtProb(replay?.probability),
        strength: fmtStrength(replay, displayCards, "Replay"),
      },
      {
        label: "Channel/mixer evidence",
        probability: fmtProb(mixer?.probability),
        strength: fmtStrength(mixer, displayCards, "Channel"),
      },
      {
        label: "Partial segment evidence",
        probability: fmtProb(partial?.max_segment_probability ?? partial?.probability),
        strength: isPartialGateNotDetected(cards) || partial?.evidence_detected === false
          ? "Low evidence (gate: Not detected)"
          : fmtStrength(partial, displayCards, "Partial"),
      },
    ],
    limitations,
    safetyWording: String(safety.wording ?? p9?.safetyWording ?? ""),
    rawJson: JSON.stringify(payload, null, 2),
  }
}

export function buildReportViewModelFromPhase9(
  phase9: Phase9ResultView,
  filename: string,
  result?: DetectionResult | null,
): ReportViewModel {
  if (result?.reportPayload) {
    return buildReportViewModelFromPayload(result.reportPayload, { filename, result })
  }

  return {
    filename,
    caseId: phase9.caseId ?? phase9.reports?.caseId ?? "—",
    statusTitle: phase9.statusTitle ?? "Analysis completed",
    voiceOriginText: phase9.voiceOriginText,
    forensicIndicatorSummary: phase9.forensicIndicatorSummary,
    highlightedSegmentText: phase9.highlightedSegmentText ?? "",
    recommendation: phase9.recommendation,
    confidenceText: phase9.confidenceText ?? "",
    duration: typeof phase9.durationSec === "number" ? `${phase9.durationSec.toFixed(1)} s` : "—",
    processingStatus: phase9.processingStatus ?? "ok",
    manualReview: phase9.manualReviewRequired ? "yes" : "no",
    evidenceCards: phase9.evidenceAxisCards,
    segmentRows:
      phase9.segmentRows?.map((row) => ({
        rank: String(row.rank),
        range: row.range,
        score: row.score,
        note: row.note,
      })) ?? [],
    axisMetrics: [
      {
        label: "AI-origin evidence",
        probability: formatScreeningScoreFromPercent(result?.details.spectralAnalysis),
        strength: "mapped",
      },
      {
        label: "Replay evidence",
        probability: formatScreeningScoreFromPercent(result?.details.temporalConsistency),
        strength: "mapped",
      },
      {
        label: "Channel/mixer evidence",
        probability: formatScreeningScoreFromPercent(result?.details.neuralNetworkScore),
        strength: "mapped",
      },
      {
        label: "Partial segment evidence",
        probability: formatScreeningScoreFromPercent(result?.details.artifactDetection),
        strength: "mapped",
      },
    ],
    limitations: [],
    safetyWording: phase9.safetyWording ?? "",
    rawJson: JSON.stringify({ phase9, filename, details: result?.details }, null, 2),
  }
}

export function buildReportViewModelFromHistory(analysis: AudioAnalysis): ReportViewModel {
  if (analysis.reportPayload) {
    return buildReportViewModelFromPayload(analysis.reportPayload, { filename: analysis.filename })
  }

  return {
    filename: analysis.filename,
    caseId: analysis.caseId ?? "—",
    statusTitle: "Saved analysis",
    voiceOriginText: analysis.isDeepfake ? "Indicators suggest synthetic or manipulated audio" : "No strong synthetic indicators detected",
    forensicIndicatorSummary: `Attack type: ${analysis.attackType ?? "unknown"}. Confidence: ${analysis.confidence}%.`,
    highlightedSegmentText: "",
    recommendation: analysis.isDeepfake
      ? "Consider manual review if this recording matters for a decision."
      : "No urgent review suggested from saved summary.",
    confidenceText: `${analysis.confidence}% confidence`,
    duration: analysis.duration,
    processingStatus: "saved",
    manualReview: analysis.isDeepfake ? "yes" : "no",
    evidenceCards: [
      {
        axis_name: "Spectral analysis",
        status: analysis.details.spectralAnalysis > 50 ? "Detected" : "Not detected",
        user_text: `${formatScreeningScoreFromPercent(analysis.details.spectralAnalysis)} indicator strength`,
      },
      {
        axis_name: "Temporal consistency",
        status: analysis.details.temporalConsistency > 50 ? "Detected" : "Not detected",
        user_text: `${formatScreeningScoreFromPercent(analysis.details.temporalConsistency)} indicator strength`,
      },
      {
        axis_name: "Channel / mixer",
        status: analysis.details.neuralNetworkScore > 50 ? "Detected" : "Not detected",
        user_text: `${formatScreeningScoreFromPercent(analysis.details.neuralNetworkScore)} indicator strength`,
      },
      {
        axis_name: "Partial segments",
        status: analysis.details.artifactDetection > 50 ? "Review candidate" : "Not detected",
        user_text: `${formatScreeningScoreFromPercent(analysis.details.artifactDetection)} indicator strength`,
      },
    ],
    segmentRows: [],
    axisMetrics: [
      { label: "Spectral analysis", probability: formatScreeningScoreFromPercent(analysis.details.spectralAnalysis), strength: "saved" },
      { label: "Temporal consistency", probability: formatScreeningScoreFromPercent(analysis.details.temporalConsistency), strength: "saved" },
      { label: "Channel / mixer", probability: formatScreeningScoreFromPercent(analysis.details.neuralNetworkScore), strength: "saved" },
      { label: "Partial segments", probability: formatScreeningScoreFromPercent(analysis.details.artifactDetection), strength: "saved" },
    ],
    limitations: analysis.caseId
      ? []
      : ["Full Phase 9 JSON was not stored for this scan. Re-run analysis for the complete report."],
    safetyWording: "",
    rawJson: JSON.stringify(analysis, null, 2),
  }
}
