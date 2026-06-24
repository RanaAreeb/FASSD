"""Plain-language helpers for PDF/HTML export (no em-dashes, neutral screening copy)."""

from __future__ import annotations

import html as html_module
from typing import Any

MISSING_VALUE = "n/a"
EM_DASH = "\u2014"
EN_DASH = "\u2013"


def plain_report_text(value: Any, *, missing: str = MISSING_VALUE) -> str:
    if value is None:
        return missing
    text = str(value).strip()
    if not text or text in {EM_DASH, EN_DASH, "-"}:
        return missing
    text = text.replace(f" {EM_DASH} ", ": ")
    text = text.replace(f"{EM_DASH} ", "")
    text = text.replace(f" {EM_DASH}", "")
    text = text.replace(EM_DASH, ", ")
    text = text.replace(f" {EN_DASH} ", " to ")
    text = text.replace(EN_DASH, " to ")
    return text


def report_axis_line(axis_name: str, status: str, user_text: str) -> str:
    parts = [plain_report_text(axis_name), plain_report_text(status)]
    detail = plain_report_text(user_text, missing="")
    if detail:
        return f"{parts[0]}: {parts[1]}. {detail}"
    return f"{parts[0]}: {parts[1]}."


def report_time_range(start: str, end: str) -> str:
    return f"{plain_report_text(start)} to {plain_report_text(end)}"


def reportlab_paragraph(text: Any, style) -> Any:
    from reportlab.platypus import Paragraph

    safe = html_module.escape(plain_report_text(text))
    return Paragraph(safe, style)
