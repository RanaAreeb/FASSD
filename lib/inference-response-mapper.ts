import { getAttackTypeForDeepfake } from "@/lib/firestore"
import {
  createEmptyDetectionResult,
  type DetectionResult,
  type EvidenceAxisCard,
  type Phase9ResultView,
} from "@/lib/detection-types"

export type LegacyAnalyzeResponse = {
  prediction: "REAL" | "FAKE"
  confidence: number
  attack_type?: string
  attack_probs?: number[]
  overall_explanation?: string
  env_reasons?: string[]
  spec_reasons?: string[]
  pooling?: string
  decision_score?: number
  effective_threshold?: number
  chunk_threshold?: number
  vote_threshold?: number
  spoof_prob_mean?: number
  spoof_prob_median?: number
  spoof_prob_trimmed?: number
  spoof_prob_logit_mean?: number
  pct_chunks_above_chunk_threshold?: number
  n_chunks_total?: number
  n_chunks_used?: number
  processing_time_s?: number
  duration_s?: number
}

export type Phase9AnalyzeResponse = {
  processing_status?: string
  error_message?: string
  case_id?: string
  phase?: string
  file_name?: string
  duration_sec?: number
  voice_origin_result?: {
    origin_label?: string
    display_text?: string
    confidence_text?: string
    explanation?: string
    ssl_origin_detected?: boolean
  }
  user_summary?: {
    voice_origin_text?: string
    forensic_indicator_summary?: string
    recommendation_text?: string
    recommendation_level?: string
    highlighted_segment_text?: string
    confidence_text?: string
    plain_language_explanation?: string
    strong_forensic_detected?: boolean
  }
  evidence_axis_cards?: EvidenceAxisCard[]
  evidence_summary?: string
  recommendation?: string
  recommendation_level?: string
  forensic_indicator_summary?: string
  partial_fabrication?: {
    show_segments_table?: boolean
    top_segments?: Array<{
      rank?: number
      start_sec?: number
      end_sec?: number
      probability?: number
      manual_review_recommended?: boolean
    }>
    segment_recommendation_label?: string
  }
  safety?: { wording?: string }
  manual_review_required?: boolean
  phase9c_report?: {
    origin_evidence?: { probability?: number }
    replay_evidence?: { probability?: number }
    mixer_channel_evidence?: { probability?: number }
    partial_fabrication_evidence?: { max_segment_probability?: number }
    audio_metadata?: { duration_sec?: number }
  }
}

export function isPhase9Response(data: unknown): data is Phase9AnalyzeResponse {
  if (!data || typeof data !== "object") return false
  const d = data as Record<string, unknown>
  return "voice_origin_result" in d || ("processing_status" in d && !("prediction" in d))
}

function formatMmSs(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

function formatSegmentRange(start?: number, end?: number): string {
  if (start == null || end == null) return "—"
  const fmt = (v: number) => {
    const m = Math.floor(v / 60)
    const s = Math.floor(v % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }
  return `${fmt(start)} – ${fmt(end)}`
}

function originLabelToScreening(isDeepfake: boolean, label: string): "clear_spoof" | "clear_bonafide" | "borderline" {
  if (label === "likely_human") return "clear_bonafide"
  if (label === "likely_ai_generated" || label === "likely_ai_generated_with_processing") return "clear_spoof"
  return isDeepfake ? "clear_spoof" : "clear_bonafide"
}

function mapOriginToDeepfake(label: string, strongForensic: boolean, sslDetected: boolean): boolean {
  if (label === "likely_human") return false
  if (label === "likely_ai_generated" || label === "likely_ai_generated_with_processing") return true
  if (sslDetected || strongForensic) return true
  return false
}

function axisConfidencePct(data: Phase9AnalyzeResponse): number {
  const report = data.phase9c_report
  const origin = report?.origin_evidence?.probability
  const replay = report?.replay_evidence?.probability
  const mixer = report?.mixer_channel_evidence?.probability
  const partial = report?.partial_fabrication_evidence?.max_segment_probability
  const values = [origin, replay, mixer, partial].filter((v): v is number => typeof v === "number")
  if (!values.length) return 50
  const max = Math.max(...values)
  const label = data.voice_origin_result?.origin_label ?? ""
  if (label === "likely_human") return Math.round(Math.max(0, Math.min(100, (1 - (origin ?? 0.5)) * 100)))
  return Math.round(Math.max(0, Math.min(100, max * 100)))
}

export function mapPhase9Response(
  data: Phase9AnalyzeResponse,
  file: File,
  processingTime: number,
): DetectionResult {
  if (data.processing_status === "error" || data.error_message) {
    return {
      ...createEmptyDetectionResult(),
      backend: "phase9",
      filename: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      isDeepfake: false,
      attackType: "Error",
      overallExplanation: data.error_message ?? "Phase 9 analysis failed.",
      duration: "—",
      processingTime,
    }
  }

  const voice = data.voice_origin_result ?? {}
  const summary = data.user_summary ?? {}
  const label = voice.origin_label ?? "inconclusive"
  const sslDetected = voice.ssl_origin_detected === true
  const strongForensic = summary.strong_forensic_detected === true
  const isDeepfake = mapOriginToDeepfake(label, strongForensic, sslDetected)
  const confidence = axisConfidencePct(data)

  const report = data.phase9c_report
  const originProb = report?.origin_evidence?.probability ?? 0
  const replayProb = report?.replay_evidence?.probability ?? 0
  const mixerProb = report?.mixer_channel_evidence?.probability ?? 0
  const partialProb = report?.partial_fabrication_evidence?.max_segment_probability ?? 0

  const durationSec = data.duration_sec ?? report?.audio_metadata?.duration_sec
  const cards = data.evidence_axis_cards ?? []

  const pf = data.partial_fabrication
  const topSegments = pf?.show_segments_table !== false ? (pf?.top_segments ?? []).slice(0, 10) : []
  const segmentRows = topSegments.map((seg) => ({
    rank: seg.rank ?? 0,
    range: formatSegmentRange(seg.start_sec, seg.end_sec),
    score: typeof seg.probability === "number" ? `${(seg.probability * 100).toFixed(1)}%` : "—",
    note: pf?.segment_recommendation_label ?? "Worth a listen",
  }))
  const segmentHighlights = topSegments
    .filter((seg) => seg.start_sec != null && seg.end_sec != null)
    .map((seg, idx) => ({
      rank: seg.rank ?? idx + 1,
      startSec: Number(seg.start_sec),
      endSec: Number(seg.end_sec),
      probability: seg.probability,
      label: formatSegmentRange(seg.start_sec, seg.end_sec),
    }))

  const phase9: Phase9ResultView = {
    caseId: data.case_id,
    phase: data.phase,
    voiceOriginText: summary.voice_origin_text ?? voice.display_text ?? "Voice origin: Inconclusive",
    voiceOriginLabel: label,
    forensicIndicatorSummary:
      summary.forensic_indicator_summary ?? data.forensic_indicator_summary ?? "",
    recommendation: summary.recommendation_text ?? data.recommendation ?? "",
    recommendationLevel: summary.recommendation_level ?? data.recommendation_level ?? "none",
    highlightedSegmentText: summary.highlighted_segment_text,
    confidenceText: summary.confidence_text ?? voice.confidence_text,
    plainLanguageExplanation: summary.plain_language_explanation ?? voice.explanation,
    evidenceAxisCards: cards,
    manualReviewRequired: data.manual_review_required !== false,
    safetyWording: data.safety?.wording,
    segmentRows,
    segmentHighlights,
  }

  const envReasons: string[] = []
  const specReasons: string[] = []
  for (const card of cards) {
    const line = `${card.axis_name}: ${card.status} — ${card.user_text}`
    if (card.score_text) specReasons.push(`${line} (${card.score_text})`)
    else specReasons.push(line)
  }
  if (data.evidence_summary) envReasons.push(data.evidence_summary)

  let attackType = "bonafide"
  if (isDeepfake) {
    const detected = cards.find((c) => c.status === "Detected")
    if (detected?.axis_name.toLowerCase().includes("replay")) attackType = "replay"
    else if (detected?.axis_name.toLowerCase().includes("partial")) attackType = "conversion"
    else if (detected?.axis_name.toLowerCase().includes("mixer")) attackType = "replay"
    else attackType = "synthesis"
  }

  return {
    ...createEmptyDetectionResult(),
    backend: "phase9",
    phase9,
    filename: file.name,
    fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    isDeepfake,
    attackType,
    verdictKind: originLabelToScreening(isDeepfake, label),
    confidence,
    processingTime,
    duration: typeof durationSec === "number" ? formatMmSs(durationSec) : "—",
    overallExplanation:
      phase9.plainLanguageExplanation ?? phase9.voiceOriginText ?? data.evidence_summary ?? "",
    envReasons,
    specReasons,
    rawMetrics: {
      pooling: data.phase ?? "phase9",
      decisionScore: originProb,
      spoofProbMean: replayProb,
      spoofProbMedian: mixerProb,
      spoofProbTrimmed: partialProb,
      attackProbs: [1 - originProb, originProb, mixerProb, replayProb],
    },
    details: {
      spectralAnalysis: Math.round(originProb * 100),
      temporalConsistency: Math.round(replayProb * 100),
      neuralNetworkScore: Math.round(mixerProb * 100),
      artifactDetection: Math.round(partialProb * 100),
    },
  }
}

export function mapLegacyResponse(
  data: LegacyAnalyzeResponse,
  file: File,
  processingTime: number,
): DetectionResult {
  const isDeepfake = data.prediction === "FAKE"
  const confidencePct = Math.max(0, Math.min(100, Math.round((data.confidence ?? 0) * 100)))
  const attackProbs = Array.isArray(data.attack_probs) ? data.attack_probs : []
  const bonafideProb =
    attackProbs[0] ??
    (isDeepfake ? 1 - (data.decision_score ?? data.confidence ?? 0) : data.confidence ?? 0)
  const synthesisProb = attackProbs[1] ?? 0
  const conversionProb = attackProbs[2] ?? 0
  const replayProb = attackProbs[3] ?? 0

  const spectralAnalysis = Math.round(
    Math.max(0, Math.min(100, (data.spoof_prob_logit_mean ?? data.confidence ?? 0) * 100)),
  )
  const temporalConsistency = Math.round(
    Math.max(
      0,
      Math.min(100, (1 - Math.abs((data.spoof_prob_mean ?? 0.5) - (data.spoof_prob_median ?? 0.5))) * 100),
    ),
  )
  const neuralNetworkScore = Math.round(
    Math.max(0, Math.min(100, (data.decision_score ?? data.confidence ?? 0) * 100)),
  )
  const artifactDetection = Math.round(
    Math.max(0, Math.min(100, Math.max(synthesisProb, conversionProb, replayProb) * 100)),
  )

  const ATK = ["bonafide", "synthesis", "conversion", "replay"] as const
  const probs = [bonafideProb, synthesisProb, conversionProb, replayProb]
  let argmax = 0
  for (let i = 0; i < 4; i++) if (probs[i] > probs[argmax]) argmax = i

  const nearVoteThreshold =
    typeof data.decision_score === "number" &&
    typeof data.effective_threshold === "number" &&
    Math.abs(data.decision_score - data.effective_threshold) <= 0.05

  const multiclassVsBinaryMismatch =
    (isDeepfake && argmax === 0) || (!isDeepfake && argmax !== 0)

  const displayAttackType = isDeepfake
    ? (data.attack_type ?? getAttackTypeForDeepfake(true))
    : "bonafide"

  return {
    ...createEmptyDetectionResult(),
    backend: "legacy",
    filename: file.name,
    fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    isDeepfake,
    attackType: displayAttackType,
    verdictKind: isDeepfake ? "clear_spoof" : "clear_bonafide",
    nearThreshold: nearVoteThreshold,
    auxiliaryDisagrees: multiclassVsBinaryMismatch,
    multiclassTopLabel: ATK[argmax] ?? "",
    multiclassTopPct: probs[argmax] * 100,
    confidence: confidencePct,
    processingTime,
    duration:
      typeof data.duration_s === "number"
        ? `${Math.floor(data.duration_s / 60)}:${Math.floor(data.duration_s % 60)
            .toString()
            .padStart(2, "0")}`
        : "—",
    overallExplanation: data.overall_explanation ?? "",
    envReasons: data.env_reasons ?? [],
    specReasons: data.spec_reasons ?? [],
    rawMetrics: {
      pooling: data.pooling ?? "",
      decisionScore: data.decision_score ?? 0,
      effectiveThreshold: data.effective_threshold ?? 0,
      chunkThreshold: data.chunk_threshold ?? 0,
      voteThreshold: data.vote_threshold ?? 0,
      spoofProbMean: data.spoof_prob_mean ?? 0,
      spoofProbMedian: data.spoof_prob_median ?? 0,
      spoofProbTrimmed: data.spoof_prob_trimmed ?? 0,
      spoofProbLogitMean: data.spoof_prob_logit_mean ?? 0,
      pctChunksAboveChunkThreshold: data.pct_chunks_above_chunk_threshold ?? 0,
      nChunksTotal: data.n_chunks_total ?? 0,
      nChunksUsed: data.n_chunks_used ?? 0,
      attackProbs: [bonafideProb, synthesisProb, conversionProb, replayProb],
    },
    details: {
      spectralAnalysis,
      temporalConsistency,
      neuralNetworkScore,
      artifactDetection,
    },
  }
}

export function mapInferenceResponse(
  data: unknown,
  file: File,
  processingTime: number,
): DetectionResult {
  if (isPhase9Response(data)) return mapPhase9Response(data, file, processingTime)
  return mapLegacyResponse(data as LegacyAnalyzeResponse, file, processingTime)
}
