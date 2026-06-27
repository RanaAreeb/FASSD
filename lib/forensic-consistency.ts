import type { EvidenceAxisCard, Phase9ResultView } from "@/lib/detection-types"

// Below this, origin evidence is too weak to override a "likely human" verdict.
const ELEVATED_ORIGIN_REVIEW_THRESHOLD = 0.50
// Above this, origin evidence alone is strong enough to call inconclusive even without
// other axes firing.
const ELEVATED_ORIGIN_INCONCLUSIVE_THRESHOLD = 0.65

/** All axes below this → treat as clear human profile (browser recordings, clean speech). */
export const CLEAR_HUMAN_AXIS_MAX = 0.35

export function evidenceStrengthFromProbability(probability: number | null | undefined): string {
  if (probability == null || !Number.isFinite(probability)) return "—"
  if (probability < CLEAR_HUMAN_AXIS_MAX) return "Low evidence"
  if (probability < 0.75) return "Moderate evidence"
  return "High evidence"
}

export function isPartialAxisDetected(cards: EvidenceAxisCard[]): boolean {
  const card = cards.find((c) => c.axis_name.toLowerCase().includes("partial"))
  if (!card?.status) return false
  const status = card.status.toLowerCase()
  return status.includes("detected") && !status.includes("not detected")
}

export function isClearHumanAxisProfile(
  originProb: number,
  replayProb: number,
  mixerProb: number,
  partialProb: number,
  cards: EvidenceAxisCard[],
  opts?: { sslDetected?: boolean; strongForensic?: boolean },
): boolean {
  if (opts?.sslDetected || opts?.strongForensic) return false
  if (isPartialAxisDetected(cards)) return false
  return (
    originProb < CLEAR_HUMAN_AXIS_MAX &&
    replayProb < CLEAR_HUMAN_AXIS_MAX &&
    mixerProb < CLEAR_HUMAN_AXIS_MAX &&
    partialProb < CLEAR_HUMAN_AXIS_MAX
  )
}

export function normalizeCardsForClearHuman(
  cards: EvidenceAxisCard[],
  originProb: number,
): EvidenceAxisCard[] {
  return cards.map((card) => {
    const axis = card.axis_name.toLowerCase()
    const isOrigin = axis.includes("origin")
    const isReplay = axis.includes("replay")
    const isChannel = axis.includes("channel") || axis.includes("mixer")
    const isPartial = axis.includes("partial")

    if (!isOrigin && !isReplay && !isChannel && !isPartial) return card

    const shouldClearStatus =
      card.status === "Review candidate" || card.status === "Detected" || card.status === "Possible overlap"

    const clearedStatus = shouldClearStatus ? "Not detected" : card.status
    const clearedText =
      isOrigin
        ? "No strong experimental AI-origin indicators on this axis. This does not prove authenticity."
        : isReplay
          ? "No strong replay indicators on this axis. This does not prove authenticity."
          : isChannel
            ? "No strong channel/mixer indicators on this axis. This does not prove authenticity."
            : "No partial-fabrication evidence detected. This does not prove the audio is authentic."

    return {
      ...card,
      status: clearedStatus,
      user_text: shouldClearStatus ? clearedText : card.user_text,
      score_text: card.score_text?.replace(/Evidence strength:\s*[^·]+$/i, "Evidence strength: Low evidence"),
    }
  })
}

export function applyClearHumanProfileCopy(
  phase9: Phase9ResultView,
  originProb: number,
  replayProb: number,
  mixerProb: number,
  partialProb: number,
  cards: EvidenceAxisCard[],
  opts?: { sslDetected?: boolean; strongForensic?: boolean },
): Phase9ResultView {
  if (!isClearHumanAxisProfile(originProb, replayProb, mixerProb, partialProb, cards, opts)) {
    return phase9
  }

  const cleanedCards = normalizeCardsForClearHuman(cards, originProb)

  return {
    ...phase9,
    voiceOriginLabel: "likely_human",
    voiceOriginText: "Voice origin: Likely human",
    forensicIndicatorSummary: "No strong manipulation indicators detected",
    recommendation: "No urgent review suggested from screening scores.",
    highlightedSegmentText: undefined,
    plainLanguageExplanation:
      "All axis screening scores are low. No strong AI-origin, replay, channel, or partial-fabrication indicators were detected. This does not prove authenticity.",
    severityLevel: "clear",
    manualReviewRequired: false,
    confidenceText: "Evidence strength: Low evidence",
    evidenceAxisCards: cleanedCards,
  }
}

export function getOriginProbabilityFromPayload(
  payload: Record<string, unknown> | null | undefined,
): number | null {
  if (!payload) return null
  const report = payload.phase9c_report as Record<string, unknown> | undefined
  const origin = report?.origin_evidence as Record<string, unknown> | undefined
  const prob = origin?.probability
  return typeof prob === "number" ? prob : null
}

export function strengthLabelFromCard(cards: EvidenceAxisCard[], needle: string): string {
  const card = cards.find((c) => c.axis_name.toLowerCase().includes(needle.toLowerCase()))
  if (!card?.score_text) return "—"
  const match = card.score_text.match(/Evidence strength:\s*(.+)$/i)
  return match?.[1]?.trim() ?? card.score_text
}

/** Returns true when the headline says human but origin score is strong enough to challenge it. */
export function hasElevatedOriginContradiction(
  originProb: number | null,
  voiceOriginText: string | undefined,
): boolean {
  if (originProb == null || originProb < ELEVATED_ORIGIN_REVIEW_THRESHOLD) return false
  const text = (voiceOriginText ?? "").toLowerCase()
  return text.includes("likely human") && !text.includes("inconclusive")
}

export function elevatedOriginContradictionMessage(originProb: number): string {
  const pct = (originProb * 100).toFixed(1)
  if (originProb < ELEVATED_ORIGIN_INCONCLUSIVE_THRESHOLD) {
    return `Origin screening score is ${pct}%. Moderately elevated but replay and channel axes are clean. Browser/microphone recording chain artifacts can raise this score for genuine human audio. Manual review is optional.`
  }
  return `Origin screening score is ${pct}%. Elevated but below the detection threshold. The summary was adjusted to inconclusive; manual review is advised.`
}

export function applyElevatedOriginSafetyCopy(phase9: Phase9ResultView, originProb: number): Phase9ResultView {
  if (!hasElevatedOriginContradiction(originProb, phase9.voiceOriginText)) return phase9

  // Moderate elevation (50–65%): soften to "likely human with elevated patterns" rather than "inconclusive".
  if (originProb < ELEVATED_ORIGIN_INCONCLUSIVE_THRESHOLD) {
    return {
      ...phase9,
      voiceOriginLabel: "likely_human_moderate_origin",
      voiceOriginText: "Voice origin: Likely human, moderate origin patterns detected",
      plainLanguageExplanation: elevatedOriginContradictionMessage(originProb),
      severityLevel: "clear",
    }
  }

  // High elevation (65%+): genuinely inconclusive.
  return {
    ...phase9,
    voiceOriginLabel: "inconclusive",
    voiceOriginText: "Voice origin: Inconclusive (elevated origin indicators)",
    plainLanguageExplanation: elevatedOriginContradictionMessage(originProb),
    severityLevel: "clear_candidate",
  }
}
