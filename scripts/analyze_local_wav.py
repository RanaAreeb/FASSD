"""POST a local WAV to the Phase 9 FastAPI /analyze-audio endpoint."""
from __future__ import annotations

import json
import sys
from pathlib import Path

import urllib.request


def main() -> None:
    wav = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(
        r"D:\FASSD\public\test\youtube_extracts\saqib_nisar_leaked_16k_mono.wav"
    )
    url = sys.argv[2] if len(sys.argv) > 2 else "http://127.0.0.1:8000/analyze-audio"
    out = wav.with_suffix(".analysis.json")

    boundary = "----FassdBoundary7MA4YWxk"
    file_bytes = wav.read_bytes()
    parts: list[bytes] = [
        f"--{boundary}\r\n".encode(),
        (
            f'Content-Disposition: form-data; name="file"; filename="{wav.name}"\r\n'
            f"Content-Type: audio/wav\r\n\r\n"
        ).encode(),
        file_bytes,
        f"\r\n--{boundary}--\r\n".encode(),
    ]
    payload = b"".join(parts)

    req = urllib.request.Request(url, data=payload, method="POST")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")

    with urllib.request.urlopen(req, timeout=600) as resp:
        data = json.loads(resp.read().decode())

    out.write_text(json.dumps(data, indent=2), encoding="utf-8")

    summary = data.get("user_summary") or {}
    report = data.get("phase9c_report") or {}
    print("processing_status:", data.get("processing_status"))
    print("case_id:", data.get("case_id"))
    print("voice_origin:", summary.get("voice_origin_text"))
    print("forensic_summary:", summary.get("forensic_indicator_summary"))
    print("recommendation:", summary.get("recommendation_text"))
    print("confidence:", summary.get("confidence_text"))
    for key in (
        "origin_evidence",
        "replay_evidence",
        "mixer_channel_evidence",
        "partial_fabrication_evidence",
    ):
        ev = report.get(key) or {}
        prob = ev.get("probability", ev.get("max_segment_probability"))
        print(f"{key}: {prob}")
    for card in data.get("evidence_axis_cards") or []:
        print(
            f"  {card.get('axis_name')}: {card.get('status')} | {card.get('score_text', '')}"
        )
    print("saved:", out)


if __name__ == "__main__":
    main()
