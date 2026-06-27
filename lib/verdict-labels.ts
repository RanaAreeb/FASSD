/** User-facing verdict copy (plain language for FYP demo / judges). */

export type FileVerdictTag = "human_likely" | "ai_likely" | "uncertain" | "error"

export function fileVerdictFromPrediction(isDeepfake: boolean): "REAL" | "FAKE" {
  return isDeepfake ? "FAKE" : "REAL"
}

/** Primary UI tag always follows the API file verdict (REAL / FAKE). */
export function fileVerdictTag(isDeepfake: boolean): FileVerdictTag {
  return isDeepfake ? "ai_likely" : "human_likely"
}

export const FILE_VERDICT_LABELS: Record<FileVerdictTag, { title: string; short: string; description: string }> = {
  human_likely: {
    title: "Sounds human-made",
    short: "Human-made",
    description:
      "Our voice checks did not find strong signs of AI generation, replay tricks, or stitched-in synthetic segments.",
  },
  ai_likely: {
    title: "Worth a closer look",
    short: "Review suggested",
    description:
      "At least one check flagged patterns that often appear with AI voices, re-recordings, or edited segments.",
  },
  uncertain: {
    title: "We need more signal",
    short: "Inconclusive",
    description: "The audio was processed, but the evidence was too mixed to suggest a clear next step on its own.",
  },
  error: {
    title: "Analysis could not finish",
    short: "Error",
    description: "Something went wrong while scanning this file. Try again or use a different recording.",
  },
}

/** Map model class names to plain labels. */
export function formatClassHint(raw: string): string {
  const key = raw.toLowerCase()
  if (key === "bonafide") return "Human (bonafide)"
  if (key === "synthesis") return "AI synthesis"
  if (key === "conversion") return "AI voice conversion"
  if (key === "replay") return "AI replay"
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

export const MULTICLASS_DISPLAY = ["Human", "AI synthesis", "AI conversion", "AI replay"] as const
