export type VerdictKind = "clear_spoof" | "clear_bonafide" | "borderline"

export interface EvidenceAxisCard {
  axis_name: string
  status: string
  user_text: string
  score_text?: string
  severity?: string
}

export interface Phase9ResultView {
  caseId?: string
  phase?: string
  statusTitle?: string
  severityLevel?: string
  processingStatus?: string
  durationSec?: number
  voiceOriginText: string
  voiceOriginLabel: string
  forensicIndicatorSummary: string
  recommendation: string
  recommendationLevel: string
  highlightedSegmentText?: string
  confidenceText?: string
  plainLanguageExplanation?: string
  evidenceAxisCards: EvidenceAxisCard[]
  manualReviewRequired: boolean
  safetyWording?: string
  segmentRows?: Array<{ rank: number; range: string; score: string; note: string }>
  segmentHighlights?: Array<{
    rank: number
    startSec: number
    endSec: number
    probability?: number
    label: string
  }>
  reports?: {
    caseId: string
    jsonAvailable: boolean
    pdfAvailable: boolean
  }
}

export interface DetectionResult {
  filename: string
  confidence: number
  isDeepfake: boolean
  attackType?: string
  processingTime: number
  fileSize: string
  duration: string
  overallExplanation?: string
  envReasons?: string[]
  specReasons?: string[]
  rawMetrics?: {
    pooling?: string
    decisionScore?: number
    effectiveThreshold?: number
    chunkThreshold?: number
    voteThreshold?: number
    spoofProbMean?: number
    spoofProbMedian?: number
    spoofProbTrimmed?: number
    spoofProbLogitMean?: number
    pctChunksAboveChunkThreshold?: number
    nChunksTotal?: number
    nChunksUsed?: number
    attackProbs?: number[]
  }
  details: {
    spectralAnalysis: number
    temporalConsistency: number
    neuralNetworkScore: number
    artifactDetection: number
  }
  verdictKind?: VerdictKind
  /** Inference backend that produced this result. */
  backend?: "legacy" | "phase9"
  /** Phase 9 experimental forensic evidence (no conclusive REAL/FAKE). */
  phase9?: Phase9ResultView
  /** Full API payload for in-app report viewer and history. */
  reportPayload?: Record<string, unknown>
  /** Score within ~5% of the effective vote threshold (informational only). */
  nearThreshold?: boolean
  /** Multiclass head argmax disagrees with file-level REAL/FAKE (informational only). */
  auxiliaryDisagrees?: boolean
  multiclassTopLabel?: string
  multiclassTopPct?: number
}

export function createEmptyDetectionResult(): DetectionResult {
  return {
    filename: "",
    confidence: 0,
    isDeepfake: false,
    attackType: "",
    processingTime: 0,
    fileSize: "",
    duration: "",
    overallExplanation: "",
    envReasons: [],
    specReasons: [],
    rawMetrics: {
      pooling: "",
      decisionScore: 0,
      effectiveThreshold: 0,
      chunkThreshold: 0,
      voteThreshold: 0,
      spoofProbMean: 0,
      spoofProbMedian: 0,
      spoofProbTrimmed: 0,
      spoofProbLogitMean: 0,
      pctChunksAboveChunkThreshold: 0,
      nChunksTotal: 0,
      nChunksUsed: 0,
      attackProbs: [],
    },
    details: {
      spectralAnalysis: 0,
      temporalConsistency: 0,
      neuralNetworkScore: 0,
      artifactDetection: 0,
    },
    verdictKind: undefined,
    multiclassTopLabel: "",
    multiclassTopPct: 0,
  }
}
