# Real-World Audio Deepfake Case Studies

## Why these case studies were selected

These case studies were selected to test FASSD on public real-world deepfake audio incidents, not only on controlled benchmark datasets. Both cases received public attention and were later discussed by investigators, journalists, or audio-forensic experts. The purpose of this page is to compare the external forensic findings with the evidence indicators produced by FASSD.

FASSD does not issue a legal certificate or a final court-ready verdict. It provides experimental evidence across multiple axes: voice origin, replay or rerecording, mixer/channel processing, and edited or partial-fabrication candidate regions. The results below should therefore be read as decision-support evidence for manual review.

**Live page:** `/case-studies`  
**Audio files:** `public/test/case_studies/`  
**Raw JSON:** `data/case_study_results/` (regenerate with `python scripts/run-case-study-analysis.py`)

---

# Case Study 1: Biden New Hampshire Robocall

**Public source:** [YouTube — Biden NH robocall clip](https://www.youtube.com/watch?v=FCs_zFbkf0M)

## Case overview

In January 2024, a robocall imitating President Joe Biden was sent to voters in New Hampshire before the state primary. The call used a cloned voice message and encouraged voters not to participate in the primary. The case became one of the most public examples of AI-generated political audio misuse because it combined voice cloning, robocall distribution, and election-related misinformation.

The case is suitable for FASSD testing because the public audio represents a phone-channel deepfake rather than a clean studio file. This makes it useful for checking whether the system can still identify AI-origin evidence when the audio has passed through a robocall or news-media recording chain.

## External forensic finding

External analysis identified the robocall as AI-generated voice audio. Pindrop reported that the clip showed synthetic voice evidence and was likely created using ElevenLabs or a similar text-to-speech system. Their analysis also used segment-level scoring, which makes this case useful for comparison with FASSD's segment and evidence-card approach.

## FASSD analysis result

**Audio tested:** `biden_nh_robocall.wav`  
**Audio duration:** `33.3 s`  
**Test date:** `2026-06-24`  
**FASSD case ID:** `case-biden-nh-robocall`

### Voice source evidence

FASSD result: `Inconclusive under replay/channel processing`  
Evidence band: `Borderline (raw origin indicator ~88.7%)`  
Screening estimate: `~88.7%`

Interpretation: The SSL origin model produced a borderline AI-origin indicator (~88.7%), but FASSD downgraded the user-facing origin label because elevated replay and mixer/channel evidence dominated the recording chain. This is consistent with a robocall or news-media copy where channel processing can mask origin cues.

Expected comparison: Because the external forensic finding describes this robocall as AI-generated voice audio, FASSD is expected to show elevated AI-origin evidence. If replay or channel evidence is also elevated, that should not be treated as a contradiction because the clip was distributed through a robocall/news-style channel.

### Recording chain evidence

Replay/rerecording result: `Elevated replay/rerecording indicator`  
Evidence band: `High`  
Screening estimate: `~96.0%`

Interpretation: Strong replay/rerecording indicators were observed across the file. This does not mean the voice is human — it reflects that the public copy likely passed through phone, broadcast, or re-recording chains.

### Channel and mix evidence

Mixer/channel result: `Elevated mixer/channel indicator`  
Evidence band: `High`  
Screening estimate: `~96.0%`

Interpretation: Elevated mixer/channel processing evidence was detected. Channel artifacts overlap with replay indicators and are expected for a robocall distributed through public media.

### Edited segment evidence

Partial/edited segment result: `Localized partial-fabrication candidate segments`  
Evidence band: `Moderate (coexists with channel context)`  
Top highlighted moments: `26.0–30.0 s (~96.0%); 30.0–33.3 s (~96.0%); 4.0–8.0 s (low contrast)`

Interpretation: Segment-level candidates were highlighted for manual review, with the strongest contrast at the end of the clip. Partial evidence coexists with replay/mixer context.

## Comparison with external forensic analysis

FASSD result compared with external finding: `Mixed / partial agreement`

Summary: External forensics described this robocall as AI-generated synthetic voice audio. FASSD produced mixed evidence: a borderline raw origin score (~88.7%) but an inconclusive origin label once replay and mixer/channel dominance were applied. Elevated replay and channel indicators align with the known robocall/news-media distribution path.

---

# Case Study 2: Baltimore/Pikesville Principal Audio

**Public source:** [YouTube — Pikesville principal clip](https://www.youtube.com/watch?v=WT-2p832IMk)

## Case overview

In 2024, an audio recording circulated online that appeared to show a Baltimore County school principal making offensive comments. The recording caused serious public harm before later reporting and investigation described it as fake or AI-generated. This case is important because it affected a local individual rather than only a public political figure.

This case is useful for FASSD because it is not only an AI-origin problem. Public forensic discussion also mentioned editing, splicing, unnatural pauses, and possible speaker-to-device recording. Therefore, it is a better test for FASSD's multi-axis design: voice origin, replay/rerecording, mixer/channel processing, and edited-segment evidence.

## External forensic finding

External experts reported strong signs that the audio was AI-generated or manipulated. Public reporting described findings from deepfake detection methods, audio editing indicators, and possible rerecording through a speaker or another device. Some expert commentary also remained cautious, noting that detector output alone should not be treated as absolute proof.

## FASSD analysis result

**Audio tested:** `pikesville_principal.wav`  
**Audio duration:** `45.0 s`  
**Test date:** `2026-06-24`  
**FASSD case ID:** `case-pikesville-principal`

### Voice source evidence

FASSD result: `Likely AI-generated`  
Evidence band: `Moderate–high (elevated AI-origin indicator)`  
Screening estimate: `~96.0%`

Interpretation: The active SSL origin model shows elevated AI-origin indicators on this public copy. This is experimental evidence only — not a conclusive authenticity decision.

### Recording chain evidence

Replay/rerecording result: `Low replay/rerecording indicator`  
Evidence band: `Low`  
Screening estimate: `~0.0%`

Interpretation: No strong replay/rerecording indicators were highlighted on this axis for the YouTube copy tested.

### Channel and mix evidence

Mixer/channel result: `Low mixer/channel indicator`  
Evidence band: `Low`  
Screening estimate: `~0.0%`

Interpretation: Mixer/channel processing evidence was low on this copy. External discussion mentioned possible speaker playback in some versions; that artifact may not survive in the particular public clip analyzed here.

### Edited segment evidence

Partial/edited segment result: `Localized partial-fabrication candidate segments`  
Evidence band: `Moderate`  
Top highlighted moments: `42.0–45.0 s (~96.0%); 14.0–18.0 s (~19.9%); 22.0–26.0 s (~12.9%)`

Interpretation: Experimental partial-fabrication evidence was detected with a localized candidate region at the end of the clip.

## Comparison with external forensic analysis

FASSD result compared with external finding: `Broad agreement`

Summary: FASSD broadly agrees with the external forensic discussion on this public copy. The system reports elevated AI-origin evidence together with partial-segment manipulation candidates, which is consistent with public reporting that described the clip as AI-generated and edited or processed.

---

## Case-study disclaimer

These case studies are provided for research and educational demonstration only. FASSD does not prove that an audio file is real or fake. Its output should be treated as experimental evidence that can help a reviewer decide which parts of an audio recording require closer manual inspection. External forensic findings are summarized from public reporting and should not be replaced by automated model output.
