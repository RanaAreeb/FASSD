"""Phase 8F multi-axis fusion rules (vendored for release/)."""

from __future__ import annotations

from typing import Any

ELEVATED_STRENGTHS = frozenset({"moderate", "high"})


def classify_evidence_strength(
    probability: float | None,
    threshold_candidate: float | None,
) -> str:
    if probability is None or threshold_candidate is None:
        return "not_evaluated"
    try:
        p = float(probability)
        th = float(threshold_candidate)
    except (TypeError, ValueError):
        return "not_evaluated"
    if p != p:
        return "not_evaluated"
    if p >= th + 0.20:
        return "high"
    if p >= th:
        return "moderate"
    if p >= th - 0.10:
        return "borderline"
    return "low"


def _evidence_label_from_prob(
    prob: float | None,
    th: float | None,
    elevated_label: str,
) -> str:
    strength = classify_evidence_strength(prob, th)
    if strength in ELEVATED_STRENGTHS:
        return elevated_label
    if strength == "borderline":
        return "borderline_indicator"
    if strength == "low":
        return "low_indicator"
    return "not_evaluated"


def fuse_origin_evidence(row: dict[str, Any]) -> dict[str, Any]:
    if not row.get("origin_model_available"):
        return {
            "origin_evidence_strength": "not_evaluated",
            "origin_evidence_label": "not_evaluated",
        }
    prob = row.get("origin_ai_probability")
    th = row.get("origin_threshold_candidate")
    return {
        "origin_evidence_strength": classify_evidence_strength(prob, th),
        "origin_evidence_label": _evidence_label_from_prob(prob, th, "elevated_ai_origin_indicator"),
    }


def fuse_replay_evidence(row: dict[str, Any]) -> dict[str, Any]:
    if not row.get("replay_model_available"):
        return {
            "replay_evidence_strength": "not_evaluated",
            "replay_evidence_label": "not_evaluated",
        }
    prob = row.get("replay_probability")
    th = row.get("replay_threshold_candidate")
    return {
        "replay_evidence_strength": classify_evidence_strength(prob, th),
        "replay_evidence_label": _evidence_label_from_prob(
            prob, th, "elevated_replay_rerecording_indicator"
        ),
    }


def fuse_mixer_evidence(row: dict[str, Any]) -> dict[str, Any]:
    if not row.get("mixer_model_available"):
        return {
            "mixer_evidence_strength": "not_evaluated",
            "mixer_evidence_label": "not_evaluated",
        }
    prob = row.get("mixer_probability")
    th = row.get("mixer_threshold_candidate")
    return {
        "mixer_evidence_strength": classify_evidence_strength(prob, th),
        "mixer_evidence_label": _evidence_label_from_prob(prob, th, "elevated_mixer_channel_indicator"),
    }


def apply_multi_axis_fusion(row: dict[str, Any]) -> dict[str, Any]:
    """Provisional multi-axis status before live partial-arbitration overrides."""
    strengths = {
        "origin": str(row.get("origin_evidence_strength", "not_evaluated")),
        "replay": str(row.get("replay_evidence_strength", "not_evaluated")),
        "mixer": str(row.get("mixer_evidence_strength", "not_evaluated")),
        "partial": str(row.get("partial_evidence_strength", "not_evaluated")),
    }

    reasons: list[str] = []
    if strengths["origin"] == "borderline":
        reasons.append("origin_borderline")
    if strengths["partial"] == "borderline":
        reasons.append("partial_borderline")
    if strengths["replay"] in ELEVATED_STRENGTHS:
        reasons.append("replay_rerecording_evidence_review")
    if strengths["mixer"] in ELEVATED_STRENGTHS:
        reasons.append("mixer_channel_evidence_review")
    if strengths["origin"] in ELEVATED_STRENGTHS:
        reasons.append("ai_origin_evidence_review")

    elevated = {axis: strengths[axis] in ELEVATED_STRENGTHS for axis in strengths}
    elevated_count = sum(1 for value in elevated.values() if value)

    if elevated_count >= 2:
        status = "suspicious_mixed_evidence_experimental"
    elif elevated["partial"]:
        status = "suspicious_partial_fabrication_experimental"
    elif elevated["replay"]:
        status = "suspicious_replay_experimental"
    elif elevated["mixer"]:
        status = "suspicious_mixer_channel_experimental"
    elif elevated["origin"]:
        status = "suspicious_origin_experimental"
    elif all(strength in {"low", "not_evaluated"} for strength in strengths.values()):
        status = "accept_human_clean_experimental"
    else:
        status = "inconclusive_manual_review_experimental"

    return {
        "experimental_fusion_status": status,
        "manual_review_required": "true",
        "manual_review_reason": ";".join(reasons) if reasons else "none",
    }


def build_fusion_trace(row: dict[str, Any]) -> str:
    parts = [
        f"origin:{row.get('origin_evidence_strength', 'na')}",
        f"replay:{row.get('replay_evidence_strength', 'na')}",
        f"mixer:{row.get('mixer_evidence_strength', 'na')}",
        f"partial:{row.get('partial_evidence_strength', 'na')}",
        f"status:{row.get('experimental_fusion_status', 'na')}",
    ]
    return ";".join(parts)
