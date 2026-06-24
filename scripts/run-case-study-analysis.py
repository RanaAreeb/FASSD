"""POST case-study WAV files to local FASSD /analyze-audio and save JSON results."""
from __future__ import annotations

import json
import urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parents[1] / "public" / "test" / "case_studies"
OUT = Path(__file__).resolve().parents[1] / "data" / "case_study_results"


def analyze(path: Path, case_id: str) -> dict:
    boundary = "----FASSDCaseStudy"
    data = path.read_bytes()
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{path.name}"\r\n'
        f"Content-Type: audio/wav\r\n\r\n"
    ).encode() + data + (
        f"\r\n--{boundary}\r\n"
        f'Content-Disposition: form-data; name="case_id"\r\n\r\n'
        f"{case_id}\r\n"
        f"--{boundary}--\r\n"
    ).encode()
    req = urllib.request.Request(
        "http://127.0.0.1:8000/analyze-audio?return_top_segments=true",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=300) as resp:
        return json.loads(resp.read().decode())


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    jobs = [
        ("biden_nh_robocall.wav", "case-biden-nh-robocall"),
        ("pikesville_principal.wav", "case-pikesville-principal"),
    ]
    for filename, case_id in jobs:
        path = BASE / filename
        print(f"Analyzing {filename} ...")
        result = analyze(path, case_id)
        out_path = OUT / f"{path.stem}_analysis.json"
        out_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
        print(f"  -> {out_path.name}  status={result.get('processing_status')}  case_id={result.get('case_id')}")


if __name__ == "__main__":
    main()
