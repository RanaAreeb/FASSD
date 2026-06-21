"""Resolve generated report files on disk by case_id."""

from __future__ import annotations

import re
from pathlib import Path

from src.app_report_formatting import repo_root

_CASE_ID_RE = re.compile(r"^[A-Za-z0-9._-]{1,128}$")


def sanitize_case_id(case_id: str) -> str:
    safe = "".join(c if c.isalnum() or c in "-_" else "_" for c in case_id.strip())[:48]
    if not safe or not _CASE_ID_RE.match(safe):
        raise ValueError("Invalid case_id")
    return safe


def json_report_dir() -> Path:
    return repo_root() / "reports" / "phase9" / "app" / "sample_outputs" / "json"


def pdf_report_dir() -> Path:
    return repo_root() / "reports" / "phase9" / "app" / "sample_outputs" / "reports"


def resolve_json_report(case_id: str) -> Path | None:
    safe = sanitize_case_id(case_id)
    path = json_report_dir() / f"{safe}_analysis.json"
    return path if path.is_file() else None


def resolve_pdf_report(case_id: str) -> Path | None:
    safe = sanitize_case_id(case_id)
    report_dir = pdf_report_dir()
    if not report_dir.is_dir():
        return None
    for pattern in (f"{safe}*_report.pdf", f"{safe}*_report.html"):
        matches = sorted(report_dir.glob(pattern), key=lambda p: p.stat().st_mtime, reverse=True)
        if matches:
            return matches[0]
    return None
