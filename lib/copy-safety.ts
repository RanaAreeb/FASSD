/** Keep forensic UI language screening-oriented, never conclusive. */

/** Hard cap for any screening score shown in UI or reports. */
export const MAX_SCREENING_DISPLAY_PERCENT = 96

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/\b100(?:\.0+)?\s*%/gi, "96%"],
  [/\b9[7-9](?:\.\d+)?\s*%/gi, "96%"],
  [/\bdefinitely\b/gi, "likely"],
  [/\bconclusive(?:ly)?\b/gi, "screening"],
  [/\bproof\b/gi, "evidence"],
  [/\bverified fake\b/gi, "review suggested"],
  [/\bverified real\b/gi, "no strong indicators"],
  [/\bAI likely\b/gi, "Review suggested"],
  [/\bHuman likely\b/gi, "No strong indicators"],
  [/\bguarantee(?:d)?\b/gi, "screening estimate"],
]

/** Clamp raw 0–1 or 0–100 value to display percent (max 96). */
export function capScreeningPercent(value: number): number {
  const pct = value > 1 ? value : value * 100
  if (!Number.isFinite(pct)) return 0
  if (pct <= 1) return 1
  return Math.min(MAX_SCREENING_DISPLAY_PERCENT, Math.max(1, pct))
}

/**
 * Format uncalibrated model scores for reports.
 * Values above 96% (including 100%) always display as 96%.
 */
export function formatScreeningScore(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—"
  const pct = capScreeningPercent(value)
  return `~${pct.toFixed(1)}%`
}

export function formatScreeningScoreFromPercent(percent: number | null | undefined): string {
  if (percent == null || !Number.isFinite(percent)) return "—"
  return formatScreeningScore(percent / 100)
}

export function softenForensicCopy(text: string | undefined | null): string {
  if (!text) return ""
  let out = text
  for (const [pattern, replacement] of REPLACEMENTS) {
    out = out.replace(pattern, replacement)
  }
  return out
}

export const FORENSIC_DISCLAIMER =
  "Screening estimate only. Not legal proof. Evidence can be inconclusive; manual review is recommended."

export const RESULTS_VS_REPORT_NOTE =
  "This page is the plain-language summary. Full report adds technical axis metrics, segment timestamps, export files, and raw JSON from the same analysis."
