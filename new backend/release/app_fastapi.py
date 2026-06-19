"""Phase 9E FastAPI — release app over Phase 9C inference + P6 partial contract."""

from __future__ import annotations

import shutil
import warnings

warnings.filterwarnings(
    "ignore",
    message=r"Support for mismatched key_padding_mask and attn_mask is deprecated.*",
    category=UserWarning,
)
import tempfile
from pathlib import Path
from typing import Any

import os

from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from src.app_report_formatting import (
    APP_NAME,
    APP_PHASE,
    RESEARCH_PROJECT_NAME,
    build_api_analyze_response,
    check_phase9c_models_available,
    enrich_phase9c_response,
    load_model_inventory,
    load_partial_module_metadata,
    load_partial_validation_summary,
    release_root,
    repo_root,
    safety_banner,
    save_json_report,
)
from src.inference_pipeline import analyze_audio_file

app = FastAPI(
    title=APP_NAME,
    version="phase9e-release",
    description="Experimental forensic evidence demo — manual review required.",
)

_cors_origins = [
    o.strip()
    for o in os.getenv(
        "CORS_ALLOW_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001",
    ).split(",")
    if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins if _cors_origins != ["*"] else ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _resolve_upload(
    audio_file: UploadFile | None,
    file: UploadFile | None,
) -> UploadFile:
    upload = audio_file or file
    if upload is None or not upload.filename:
        raise HTTPException(status_code=400, detail="Missing audio file (use form field audio_file or file).")
    return upload

_models_checked = False
_models_ok = False
_models_err = ""
_ssl_warmed = False
_ssl_warm_err = ""


def _warmup_inference_stack() -> None:
    """Load joblib + WavLM once at startup so /analyze does not block on HF download."""
    global _models_checked, _models_ok, _models_err, _ssl_warmed, _ssl_warm_err
    _ensure_models_checked()
    if not _models_ok:
        return
    try:
        from src.model_loader import load_all_active_models
        from src.phase8_vendor import (
            import_phase8c_feature_utils,
            import_phase8d_ssl_utils,
            import_phase8f_fusion_rules,
        )
        from src.ssl_embeddings import load_ssl_extractor

        import_phase8c_feature_utils()
        import_phase8d_ssl_utils()
        import_phase8f_fusion_rules()
        load_all_active_models()
        load_ssl_extractor(device="auto")
        _ssl_warmed = True
        _ssl_warm_err = ""
    except Exception as exc:
        _ssl_warmed = False
        _ssl_warm_err = str(exc)


@app.on_event("startup")
def _on_startup() -> None:
    _warmup_inference_stack()


def _ensure_models_checked() -> None:
    global _models_checked, _models_ok, _models_err
    if not _models_checked:
        _models_ok, _models_err = check_phase9c_models_available()
        _models_checked = True


@app.get("/")
def root() -> dict[str, Any]:
    return {
        "app_name": APP_NAME,
        "research_project": RESEARCH_PROJECT_NAME,
        "phase": APP_PHASE,
        "status": "experimental_forensic_demo",
        "message": "Phase 9C/9E release forensic prototype API",
        "endpoints": ["/", "/health", "/model-info", "/analyze-audio", "/analyze"],
        "safety": safety_banner(),
        "primary_app_path": "release/",
    }


@app.get("/health")
def health() -> dict[str, Any]:
    _ensure_models_checked()
    meta = load_partial_module_metadata()
    return {
        "status": "ok",
        "phase": APP_PHASE,
        "models_loaded": _models_ok,
        "models_load_error": _models_err if not _models_ok else "",
        "ssl_warmed": _ssl_warmed,
        "ssl_warm_error": _ssl_warm_err if not _ssl_warmed else "",
        "ready_for_analyze": bool(_models_ok and _ssl_warmed),
        "partial_module_status": meta.get("status", "experimental_manual_review_only"),
        "manual_review_required": bool(meta.get("manual_review_required", True)),
        "conclusive_authenticity_decision": False,
    }


@app.get("/model-info")
def model_info() -> dict[str, Any]:
    _ensure_models_checked()
    meta = load_partial_module_metadata()
    inv = load_model_inventory()
    val = load_partial_validation_summary()
    return {
        "phase": APP_PHASE,
        "status": "experimental_forensic_prototype",
        "models_loaded": _models_ok,
        "model_inventory_summary": {
            "status": inv.get("status"),
            "model_count": len(inv.get("models", [])),
            "integration_modules": list((inv.get("integration_modules") or {}).keys()),
            "warnings": inv.get("warnings", [])[:5],
        },
        "partial_fabrication_experimental_p5b": {
            "package_path": str(release_root() / "models" / "partial_fabrication_experimental_p5b"),
            "metadata": meta,
            "thresholds": meta.get("thresholds", {}),
            "limitations": meta.get("limitations", []),
            "validation_summary": val,
        },
        "manual_review_required": True,
        "conclusive_authenticity_decision": False,
        "operational_deployment_claim": False,
        "legal_evidence_claim": False,
        "safety": safety_banner(),
    }


@app.post("/analyze-audio")
async def analyze_audio(
    audio_file: UploadFile | None = File(default=None),
    file: UploadFile | None = File(default=None),
    case_id: str | None = Form(default=None),
    return_top_segments: bool = Query(default=True),
    save_report: bool = Query(default=False),
    generate_report: bool = Query(default=False),
    generate_visual: bool = Query(default=False),
) -> dict[str, Any]:
    _ensure_models_checked()
    upload = _resolve_upload(audio_file, file)
    if not _models_ok:
        return {
            "processing_status": "error",
            "error_message": f"Phase 9C models not loaded: {_models_err}",
            "manual_review_required": True,
            "partial_fabrication": {
                "module_status": "experimental_manual_review_only",
                "evidence_label": "partial_fabrication_analysis_unavailable",
                "user_facing_message": (
                    "Partial-fabrication analysis was unavailable for this file. "
                    "Manual forensic review is recommended if partial manipulation is suspected."
                ),
            },
        }
    if not _ssl_warmed:
        return {
            "processing_status": "error",
            "error_message": (
                "SSL origin model (WavLM) is not ready yet. "
                f"Wait for startup download to finish or check network/Hugging Face access. {_ssl_warm_err}"
            ).strip(),
            "manual_review_required": True,
            "safety": safety_banner(),
        }

    suffix = Path(upload.filename or "upload.wav").suffix or ".wav"
    tmp_path: Path | None = None
    output_dir = None
    save_path = None
    if save_report:
        output_dir = repo_root() / "reports" / "phase9" / "app" / "sample_outputs"
        output_dir.mkdir(parents=True, exist_ok=True)

    file_label = upload.filename or "upload"
    payload: dict[str, Any]
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(upload.file, tmp)
            tmp_path = Path(tmp.name)
        file_label = upload.filename or tmp_path.name

        phase9c = analyze_audio_file(
            audio_path=str(tmp_path),
            case_id=case_id,
            output_dir=output_dir,
            device="auto",
            return_debug=return_top_segments,
        )
        if save_report and output_dir and phase9c.get("case_id"):
            save_path = str(output_dir / f"{phase9c['case_id']}_analysis.json")

        payload = build_api_analyze_response(
            file_name=file_label,
            phase9c_result=phase9c,
            return_top_segments=return_top_segments,
            save_report_path=save_path,
        )

        if generate_report or save_report or generate_visual:
            enriched = enrich_phase9c_response(
                phase9c,
                file_name=file_label,
                return_top_segments=return_top_segments,
            )
            if save_report and not save_path:
                save_path = save_json_report(enriched)
                payload["saved_report_path"] = save_path

            waveform_path: str | None = None
            if generate_visual:
                try:
                    from src.app_visualization import generate_waveform_highlight

                    waveform_path = generate_waveform_highlight(str(tmp_path), enriched)
                    payload["waveform_image_path"] = waveform_path
                except Exception as exc:
                    payload["waveform_image_path"] = None
                    payload["waveform_error"] = str(exc)

            if generate_report:
                try:
                    from src.pdf_report_generator import generate_pdf_report

                    payload["pdf_report_path"] = generate_pdf_report(
                        enriched, waveform_image_path=waveform_path
                    )
                except Exception as exc:
                    payload["pdf_report_path"] = None
                    payload["pdf_report_error"] = str(exc)
    except Exception as exc:
        payload = {
            "processing_status": "error",
            "error_message": str(exc),
            "file_name": file_label,
            "manual_review_required": True,
            "safety": safety_banner(),
        }
    finally:
        if tmp_path is not None:
            try:
                tmp_path.unlink(missing_ok=True)
            except OSError:
                pass

    return payload


# Backward-compatible alias used by older clients/tests.
@app.post("/analyze")
async def analyze_legacy(
    audio_file: UploadFile | None = File(default=None),
    file: UploadFile | None = File(default=None),
    case_id: str | None = Form(default=None),
) -> dict[str, Any]:
    return await analyze_audio(audio_file=audio_file, file=file, case_id=case_id)
