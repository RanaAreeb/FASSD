export interface TestAudioSample {
  id: string
  label: string
  category: string
  path: string
  hint: string
}

const CASE_STUDY_CATEGORY = "Real-world case study"

/** Curated clips from /public/test for quick FYP panel demos. Case studies listed first. */
export const TEST_AUDIO_SAMPLES: TestAudioSample[] = [
  {
    id: "case-pikesville-principal",
    label: "pikesville_principal.wav",
    category: CASE_STUDY_CATEGORY,
    path: "/test/case_studies/pikesville_principal.wav",
    hint: "Pikesville principal deepfake, public YouTube extract",
  },
  {
    id: "case-saqib-nisar-leaked",
    label: "saqib_nisar_leaked.wav",
    category: CASE_STUDY_CATEGORY,
    path: "/test/case_studies/saqib_nisar_leaked.wav",
    hint: "Saqib Nisar leaked audio, public YouTube news extract",
  },
  {
    id: "case-biden-robocall",
    label: "biden_nh_robocall.wav",
    category: CASE_STUDY_CATEGORY,
    path: "/test/case_studies/biden_nh_robocall.wav",
    hint: "Biden NH robocall, public YouTube extract",
  },
  {
    id: "human-clean-001",
    label: "Human_001.wav",
    category: "Human clean",
    path: "/test/human_clean/Human_001.wav",
    hint: "Bonafide human speech reference",
  },
  {
    id: "human-clean-021",
    label: "Human_021.mp3",
    category: "Human clean",
    path: "/test/human_clean/Human_021.mp3",
    hint: "Shorter human clip",
  },
  {
    id: "ai-clean-001",
    label: "AI_001.mp3",
    category: "AI clean",
    path: "/test/ai_clean/AI_001.mp3",
    hint: "Known synthetic speech sample",
  },
  {
    id: "ai-clean-010",
    label: "AI_010.mp3",
    category: "AI clean",
    path: "/test/ai_clean/AI_010.mp3",
    hint: "Another AI-only clip",
  },
  {
    id: "human-repeat-001",
    label: "human_001.mp3",
    category: "Human repeat",
    path: "/test/human_repeat/human_001.mp3",
    hint: "Repeated human recording variant",
  },
  {
    id: "ai-repeat-001",
    label: "AI_001.mp3",
    category: "AI repeat",
    path: "/test/ai_repeat/AI_001.mp3",
    hint: "Repeated AI recording variant",
  },
  {
    id: "mixed-human-001",
    label: "Human_001_mixed.wav",
    category: "Mixed (human base)",
    path: "/test/dataset_mixed/Human_001_mixed.wav",
    hint: "Human audio with inserted segment",
  },
  {
    id: "mixed-ai-001",
    label: "AI_001_mixed.mp3",
    category: "Mixed (AI base)",
    path: "/test/dataset_ai_mixed/AI_001_mixed.mp3",
    hint: "AI audio with inserted human segment",
  },
]

/** Map /test/... public path to same-origin API that reads from disk (works when gitignored). */
export function testAudioFetchUrl(publicPath: string): string {
  const relative = publicPath.replace(/^\/test\//, "").replace(/^\//, "")
  return `/api/test-audio/${relative}`
}

export async function fetchTestSampleAsFile(sample: TestAudioSample): Promise<File> {
  const response = await fetch(testAudioFetchUrl(sample.path))
  if (!response.ok) {
    const detail = await response.json().catch(() => null)
    const hint =
      typeof detail?.detail === "string"
        ? detail.detail
        : `Missing file at public${sample.path}`
    throw new Error(`Could not load ${sample.label}. ${hint}`)
  }
  const blob = await response.blob()
  const name = sample.path.split("/").pop() ?? `${sample.id}.audio`
  const ext = name.split(".").pop()?.toLowerCase()
  const type =
    blob.type ||
    (ext === "wav" ? "audio/wav" : ext === "mp3" ? "audio/mpeg" : "application/octet-stream")
  return new File([blob], name, { type })
}
