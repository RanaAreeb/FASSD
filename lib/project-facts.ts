/** Product + FYP facts — aligned with Phase 9 release backend (`new backend/release/`). */

export const PROJECT = {
  name: "DeepFakeDetection",
  logoMark: "DFD",
  namePrimary: "DeepFake",
  nameAccent: "Detection",
  fullName: "DeepFake Detection — AI-powered synthetic speech screening",
  domain: "deepfakedetection.dev",
  tagline:
    "Multi-axis voice integrity checks — origin, replay, channel, and partial segments — with experimental evidence indicators only.",
  disclaimer:
    "Outputs are experimental evidence indicators for research and demos — not legal proof of authenticity or fraud. Manual review is recommended.",
}

/** Sidebar + marketing pipeline (matches `release/src/inference_pipeline.py`). */
export const PHASE9_PIPELINE_STEPS = [
  { step: "01", label: "Decode", detail: "16 kHz mono normalization" },
  { step: "02", label: "Segment", detail: "4 s windows · 2 s hop across the file" },
  { step: "03", label: "Features", detail: "Acoustic stats + WavLM SSL embeddings" },
  { step: "04", label: "Four models", detail: "Origin · replay · channel · partial segments" },
  { step: "05", label: "Fuse & report", detail: "Multi-axis evidence · manual-review wording" },
] as const

export const PIPELINE_SUBTITLE =
  "Phase 9 release · four experimental evidence models (no single fake/real score)"

export const MODEL_SPECS = [
  { label: "Active models", value: "4 axis indicators (Phase 9B)" },
  { label: "Origin axis", value: "WavLM SSL · origin_file_model" },
  { label: "Replay axis", value: "Acoustic · replay_file_model" },
  { label: "Mixer / channel", value: "Acoustic · mixer_file_model" },
  { label: "Partial axis", value: "Combined · partial_segment model" },
  { label: "Segmentation", value: "4 s windows · 2 s hop @ 16 kHz" },
  { label: "Output", value: "Separate evidence axes + fusion status" },
] as const

/** Per-axis cards for architecture bento — matches `release/MODEL_REGISTRY.md`. */
export const ARCHITECTURE_AXES = [
  {
    label: "Origin",
    model: "origin_file_model",
    features: "WavLM SSL file embedding",
    threshold: "0.92",
    note: "AI vs human source indicator",
  },
  {
    label: "Replay",
    model: "replay_file_model",
    features: "File-level acoustic features",
    threshold: "0.65",
    note: "Rerecording — not AI-generated",
  },
  {
    label: "Mixer / channel",
    model: "mixer_file_model",
    features: "File-level acoustic features",
    threshold: "0.75",
    note: "Processing effects — not AI-generated",
  },
  {
    label: "Partial segments",
    model: "partial_fabrication_segment_model",
    features: "Segment acoustic + SSL + localization",
    threshold: "0.95",
    note: "Candidate spans for manual review",
  },
] as const

/** Compact tiles for the architecture bento (6 slots beside the hero card). */
export const BENTO_SMALL_TILES = [
  ...ARCHITECTURE_AXES.map((axis) => ({
    key: axis.model,
    label: axis.label.toUpperCase(),
    value: axis.features,
    meta: `≥ ${axis.threshold}`,
  })),
  {
    key: "segmentation",
    label: "SEGMENTATION",
    value: "4 s windows · 2 s hop @ 16 kHz",
    meta: "segmentation.py",
  },
  {
    key: "output",
    label: "OUTPUT",
    value: "Separate evidence axes + fusion status",
    meta: "/analyze",
  },
] as const

export const INFERENCE_DEFAULTS = [
  { label: "Origin threshold", value: "0.92 (candidate)" },
  { label: "Replay threshold", value: "0.65 (candidate)" },
  { label: "Mixer threshold", value: "0.75 (candidate)" },
  { label: "Partial threshold", value: "0.95 (candidate)" },
] as const

export const PIPELINE_STEPS = [
  {
    step: "01",
    title: "Decode & normalize",
    description: "Load audio as 16 kHz mono for consistent feature extraction.",
  },
  {
    step: "02",
    title: "Segment the file",
    description: "Slide 4 s windows with 2 s hop to score short spans for partial-fabrication cues.",
  },
  {
    step: "03",
    title: "Extract features",
    description: "File-level acoustic + WavLM SSL embeddings; per-segment acoustic, SSL, and localization features.",
  },
  {
    step: "04",
    title: "Run four models",
    description:
      "Origin (SSL), replay (acoustic), mixer/channel (acoustic), and partial segment (combined) — each axis stays separate.",
  },
  {
    step: "05",
    title: "Fuse & explain",
    description:
      "Phase 8F multi-axis fusion, candidate segments, safe forensic summary, and manual-review recommended wording.",
  },
] as const

export const CAPABILITIES = [
  {
    title: "Four independent checks",
    description:
      "Voice source, replay signs, channel/mix effects, and edited segments are scored separately — not collapsed into one fake score.",
    tag: "Phase 9",
  },
  {
    title: "SSL origin model",
    description: "WavLM embeddings power the AI-vs-human origin axis with calibrated evidence bands in the UI.",
    tag: "WavLM",
  },
  {
    title: "Segment highlights",
    description: "Partial module surfaces timestamp candidates on the waveform for optional manual listening.",
    tag: "Segments",
  },
  {
    title: "Live web demo",
    description: "Next.js dashboard uploads audio to the Phase 9 FastAPI service in `new backend/release/`.",
    tag: "Integrated",
  },
  {
    title: "Safe forensic wording",
    description: "Experimental prototype language, manual review flags, and no court-ready verdict claims.",
    tag: "Safety",
  },
  {
    title: "History (optional)",
    description: "Signed-in users can save summary results to Firebase when rules allow.",
    tag: "Firestore",
  },
] as const

export const USE_CASES = [
  {
    title: "Media verification",
    description: "Screen interview clips or viral audio before publication; pair with editorial review.",
    icon: "media" as const,
  },
  {
    title: "Security awareness",
    description: "Demonstrate voice-cloning risk in workshops using live multi-axis evidence, not canned demos.",
    icon: "security" as const,
  },
  {
    title: "Research & FYP",
    description: "Reproduce Phase 9 release runs via CLI or API and compare axis outputs in JSON reports.",
    icon: "research" as const,
  },
  {
    title: "Call-center triage",
    description: "Flag suspicious recordings for human review — not automated blocking or legal verdicts.",
    icon: "calls" as const,
  },
] as const

export const VALIDATION_NOTE =
  "Phase 9B models are experimental forensic indicators. Phase 9C smoke tests pass on release sample cases; broader Phase 9D batch validation is documented separately."
