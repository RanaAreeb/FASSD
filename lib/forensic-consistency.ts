import type { EvidenceAxisCard, Phase9ResultView } from "@/lib/detection-types"

const ELEVATED_ORIGIN_REVIEW_THRESHOLD = 0.35

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

/** Headline contradicts elevated origin screening score — unsafe to show as clearly human. */
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
  return `Origin screening score is ${pct}% — elevated but below the detection threshold. The summary was adjusted to inconclusive; manual review is advised.`
}

export function applyElevatedOriginSafetyCopy(phase9: Phase9ResultView, originProb: number): Phase9ResultView {
  if (!hasElevatedOriginContradiction(originProb, phase9.voiceOriginText)) return phase9
  return {
    ...phase9,
    voiceOriginLabel: "inconclusive",
    voiceOriginText: "Voice origin: Inconclusive (elevated origin indicators)",
    plainLanguageExplanation: elevatedOriginContradictionMessage(originProb),
    severityLevel: "clear_candidate",
  }
}
