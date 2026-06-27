/** Real-world deepfake case studies — audio from public YouTube clips, analyzed by FASSD. */

export interface CaseStudyAxisResult {
  result: string
  band: string
  screeningScore: string
  interpretation: string
}

export interface CaseStudyRecord {
  id: string
  slug: string
  title: string
  subtitle: string
  youtubeUrl: string
  overview: string
  externalFinding: string
  audioFilename: string
  audioPath: string
  durationSec: number
  durationLabel: string
  testDate: string
  caseId: string
  sourceNote: string
  origin: CaseStudyAxisResult
  replay: CaseStudyAxisResult
  mixer: CaseStudyAxisResult
  partial: CaseStudyAxisResult & { topSegments: string }
  agreementLevel: string
  comparisonSummary: string
  fusionStatus: string
}

export const CASE_STUDIES_INTRO = {
  title: "Real-World Audio Deepfake Case Studies",
  whySelected:
    "These case studies test FASSD on public real-world deepfake audio incidents, not only on controlled benchmark datasets. Both cases received public attention and were later discussed by investigators, journalists, or audio-forensic experts. The purpose is to compare external forensic findings with the evidence indicators produced by FASSD.",
  disclaimer:
    "FASSD does not issue a legal certificate or a final court-ready verdict. It provides experimental evidence across multiple axes: voice origin, replay or rerecording, mixer/channel processing, and edited or partial-fabrication candidate regions. Results below should be read as decision-support evidence for manual review.",
  footerDisclaimer:
    "These case studies are provided for research and educational demonstration only. FASSD does not prove that an audio file is real or fake. Its output should be treated as experimental evidence that can help a reviewer decide which parts of an audio recording require closer manual inspection. External forensic findings are summarized from public reporting and should not be replaced by automated model output.",
}

export const REAL_WORLD_CASE_STUDIES: CaseStudyRecord[] = [
  {
    id: "biden-nh-robocall",
    slug: "biden-nh-robocall",
    title: "Biden New Hampshire Robocall",
    subtitle: "January 2024 political robocall, phone-channel AI voice clone",
    youtubeUrl: "https://www.youtube.com/watch?v=FCs_zFbkf0M",
    overview:
      "In January 2024, a robocall imitating President Joe Biden was sent to voters in New Hampshire before the state primary. The call used a cloned voice message and encouraged voters not to participate in the primary. The case became one of the most public examples of AI-generated political audio misuse because it combined voice cloning, robocall distribution, and election-related misinformation. The public YouTube copy used here is useful for FASSD because it represents a phone-channel deepfake that passed through a news-media recording chain rather than a clean studio file.",
    externalFinding:
      "External analysis identified the robocall as AI-generated voice audio. Pindrop reported that the clip showed synthetic voice evidence and was likely created using ElevenLabs or a similar text-to-speech system. Their analysis also used segment-level scoring, which makes this case useful for comparison with FASSD's segment and evidence-card approach.",
    audioFilename: "biden_nh_robocall.wav",
    audioPath: "/test/case_studies/biden_nh_robocall.wav",
    durationSec: 33.26,
    durationLabel: "33.3 s",
    testDate: "2026-06-24",
    caseId: "case-biden-nh-robocall",
    sourceNote:
      "Audio extracted from the public YouTube clip (16 kHz mono WAV). Channel compression and re-upload artifacts are expected.",
    origin: {
      result: "Inconclusive under replay/channel processing",
      band: "Borderline (raw origin indicator ~88.7%)",
      screeningScore: "~88.7%",
      interpretation:
        "The SSL origin model produced a borderline AI-origin indicator (~88.7%), but FASSD downgraded the user-facing origin label because elevated replay and mixer/channel evidence dominated the recording chain. This is consistent with a robocall or news-media copy where channel processing can mask origin cues. This is experimental evidence only, not a conclusive authenticity decision.",
    },
    replay: {
      result: "Elevated replay/rerecording indicator",
      band: "High",
      screeningScore: "~96.0%",
      interpretation:
        "Strong replay/rerecording indicators were observed across the file. This does not mean the voice is human. It reflects that the public copy likely passed through phone, broadcast, or re-recording chains. Review together with mixer/channel evidence.",
    },
    mixer: {
      result: "Elevated mixer/channel indicator",
      band: "High",
      screeningScore: "~96.0%",
      interpretation:
        "Elevated mixer/channel processing evidence was detected. For this case, channel artifacts overlap with replay indicators and are expected for a robocall distributed through public media.",
    },
    partial: {
      result: "Localized partial-fabrication candidate segments",
      band: "Moderate (coexists with channel context)",
      screeningScore: "Top segment ~96.0%",
      interpretation:
        "Segment-level candidates were highlighted for manual review, with the strongest contrast at the end of the clip. Partial evidence coexists with replay/mixer context, so segments should be reviewed alongside channel indicators rather than as standalone proof of splicing.",
      topSegments: "26.0–30.0 s (~96.0%); 30.0–33.3 s (~96.0%); 4.0–8.0 s (low contrast)",
    },
    agreementLevel: "Mixed / partial agreement",
    comparisonSummary:
      "External forensics described this robocall as AI-generated synthetic voice audio. FASSD produced mixed evidence: a borderline raw origin score (~88.7%) but an inconclusive origin label once replay and mixer/channel dominance were applied. Elevated replay and channel indicators align with the known robocall/news-media distribution path. FASSD did not emit a clean single-axis AI-origin verdict on this public copy, which is documented as a limitation when phone-channel compression and re-recording reduce origin reliability.",
    fusionStatus: "suspicious_mixed_evidence_experimental",
  },
  {
    id: "pikesville-principal",
    slug: "pikesville-principal",
    title: "Baltimore/Pikesville Principal Audio",
    subtitle: "2024 school principal deepfake, multi-axis manipulation case",
    youtubeUrl: "https://www.youtube.com/watch?v=WT-2p832IMk",
    overview:
      "In 2024, an audio recording circulated online that appeared to show a Baltimore County school principal making offensive comments. The recording caused serious public harm before later reporting and investigation described it as fake or AI-generated. This case is important because it affected a local individual rather than only a public political figure. Public forensic discussion also mentioned editing, splicing, unnatural pauses, and possible speaker-to-device recording, making it a stronger test for FASSD's multi-axis design.",
    externalFinding:
      "External experts reported strong signs that the audio was AI-generated or manipulated. Public reporting described findings from deepfake detection methods, audio editing indicators, and possible rerecording through a speaker or another device. Some expert commentary also remained cautious, noting that detector output alone should not be treated as absolute proof.",
    audioFilename: "pikesville_principal.wav",
    audioPath: "/test/case_studies/pikesville_principal.wav",
    durationSec: 45.05,
    durationLabel: "45.0 s",
    testDate: "2026-06-24",
    caseId: "case-pikesville-principal",
    sourceNote:
      "Audio extracted from the public YouTube clip (16 kHz mono WAV). Public copies may be compressed, clipped, or re-uploaded.",
    origin: {
      result: "Likely AI-generated",
      band: "Moderate–high (elevated AI-origin indicator)",
      screeningScore: "~96.0%",
      interpretation:
        "The active SSL origin model shows elevated AI-origin indicators on this public copy. This is experimental evidence only, not a conclusive authenticity decision. Manual review is still recommended.",
    },
    replay: {
      result: "Low replay/rerecording indicator",
      band: "Low",
      screeningScore: "~0.0%",
      interpretation:
        "No strong replay/rerecording indicators were highlighted on this axis for the YouTube copy tested. This does not prove the recording chain was pristine. Replay cues were not dominant in this file.",
    },
    mixer: {
      result: "Low mixer/channel indicator",
      band: "Low",
      screeningScore: "~0.0%",
      interpretation:
        "Mixer/channel processing evidence was low on this copy. External discussion mentioned possible speaker playback in some versions; that artifact may not survive in the particular public clip analyzed here.",
    },
    partial: {
      result: "Localized partial-fabrication candidate segments",
      band: "Moderate",
      screeningScore: "Top segment ~96.0%",
      interpretation:
        "Experimental partial-fabrication evidence was detected with a localized candidate region at the end of the clip. Highlighted spans are candidate areas for manual forensic review, not conclusive proof of editing.",
      topSegments: "42.0–45.0 s (~96.0%); 14.0–18.0 s (~19.9%); 22.0–26.0 s (~12.9%)",
    },
    agreementLevel: "Broad agreement",
    comparisonSummary:
      "FASSD broadly agrees with the external forensic discussion on this public copy. The system reports elevated AI-origin evidence together with partial-segment manipulation candidates, which is consistent with public reporting that described the clip as AI-generated and edited or processed. Replay and mixer axes were not dominant on this YouTube extract.",
    fusionStatus: "suspicious_mixed_evidence_experimental",
  },
]

export function getCaseStudyBySlug(slug: string): CaseStudyRecord | undefined {
  return REAL_WORLD_CASE_STUDIES.find((c) => c.slug === slug)
}
