/** Public company identity for the marketing site (AWS Activate / investor ready). */

export const COMPANY = {
  legalName: "DeepFake Detection",
  productName: "DeepFakeDetection",
  domain: "deepfakedetection.dev",
  contactEmail: "founders@deepfakedetection.dev",
  supportEmail: "founders@deepfakedetection.dev",
  tagline: "Voice integrity screening for synthetic speech.",
  oneLiner:
    "Multi axis forensic audio analysis that screens recordings for AI origin cues, replay artifacts, channel processing, and partial fabrication, then surfaces evidence for human review.",
  researchOrigin:
    "Developed from academic R&D in forensic audio analysis and now being built into a cloud based voice integrity platform.",
  disclaimer:
    "Outputs are experimental screening indicators for research, media verification, and awareness workflows, not legal proof of authenticity or fraud. Manual review is always recommended.",
} as const

export const TEAM = [
  {
    name: "Rana Areeb",
    role: "Founder",
    bio: "Building DeepFakeDetection from forensic acoustics research into a practical voice integrity platform for media, security, and research teams.",
  },
] as const

export const COMPANY_USE_CASES = [
  {
    title: "Media verification",
    description:
      "Screen interview clips and viral audio before publication. Review multi axis evidence alongside editorial judgment.",
  },
  {
    title: "Security awareness",
    description:
      "Demonstrate voice cloning risk in workshops with live analysis, not canned demos or single fake or real scores.",
  },
  {
    title: "Call center triage",
    description:
      "Flag suspicious recordings for human review. Designed to support operators, not automate legal decisions.",
  },
  {
    title: "Research and evaluation",
    description:
      "Reproduce multi axis runs via the live lab or API, inspect features, and compare axis outputs in structured reports.",
  },
] as const
