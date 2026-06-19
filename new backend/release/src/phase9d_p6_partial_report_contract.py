"""P6 partial-fabrication report contract (vendored for release/ standalone use)."""

from __future__ import annotations

from typing import Any

EVIDENCE_LABEL_DETECTED = "partial_fabrication_evidence_detected"
EVIDENCE_LABEL_NOT_DETECTED = "partial_fabrication_evidence_not_detected"
EVIDENCE_LABEL_UNAVAILABLE = "partial_fabrication_analysis_unavailable"

MODULE_STATUS = "experimental_manual_review_only"

WORDING_DETECTED = (
    "Experimental partial-fabrication evidence was detected. "
    "The highlighted segment is a candidate region for manual forensic review; "
    "this is not a conclusive authenticity decision."
)
WORDING_NOT_DETECTED = (
    "No partial-fabrication evidence was detected by the experimental partial module. "
    "This does not prove the audio is authentic; subtle or unseen partial manipulations may still be missed."
)
WORDING_UNAVAILABLE = (
    "Partial-fabrication analysis was unavailable for this file. "
    "Manual forensic review is recommended if partial manipulation is suspected."
)

FORENSIC_SUMMARY_SAFE = "Experimental forensic evidence indicators only; manual review recommended"


def format_partial_evidence_contract(
    *,
    analysis_ok: bool,
    evidence_detected: bool,
    file_gate_probability: float | None,
    max_segment_probability: float | None,
    high_segment_fraction: float | None,
    topk_minus_rest_probability: float | None,
    broad_activation_flag: bool | None,
    candidate_segment_start: float | None,
    candidate_segment_end: float | None,
    candidate_segment_probability: float | None,
    candidate_segment_rank: int | None,
    top_segments: list[dict[str, Any]],
    extra_limitations: list[str] | None = None,
) -> dict[str, Any]:
    limitations = [
        "Experimental partial-fabrication evidence indicator only.",
        "Conclusive authenticity decision: no.",
        "Manual forensic review is recommended.",
    ]
    if extra_limitations:
        limitations.extend(extra_limitations)
    limitations = list(dict.fromkeys(limitations))

    candidate_segment = None
    if candidate_segment_start is not None and candidate_segment_end is not None:
        candidate_segment = {
            "start_sec": candidate_segment_start,
            "end_sec": candidate_segment_end,
            "probability": candidate_segment_probability,
            "rank": candidate_segment_rank,
        }

    if not analysis_ok:
        evidence_label = EVIDENCE_LABEL_UNAVAILABLE
        user_message = WORDING_UNAVAILABLE
        detected = None
    elif evidence_detected:
        evidence_label = EVIDENCE_LABEL_DETECTED
        user_message = WORDING_DETECTED
        detected = True
    else:
        evidence_label = EVIDENCE_LABEL_NOT_DETECTED
        user_message = WORDING_NOT_DETECTED
        detected = False

    section: dict[str, Any] = {
        "module_status": MODULE_STATUS,
        "evidence_detected": detected,
        "evidence_label": evidence_label,
        "file_gate_probability": file_gate_probability,
        "max_segment_probability": max_segment_probability,
        "high_segment_fraction": high_segment_fraction,
        "topk_minus_rest_probability": topk_minus_rest_probability,
        "broad_activation_flag": broad_activation_flag,
        "candidate_segment": candidate_segment,
        "top_segments": top_segments,
        "thresholds": {
            "file_gate_threshold": 0.5,
            "segment_threshold": 0.9,
            "contrast_threshold": 0.25,
            "broad_limit": 0.45,
        },
        "limitations": limitations,
        "user_facing_message": user_message,
    }
    return {"partial_fabrication": section}
