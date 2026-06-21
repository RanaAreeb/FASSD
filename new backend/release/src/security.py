"""Upload limits and inference API authentication."""

from __future__ import annotations

import os
import tempfile
from functools import lru_cache
from pathlib import Path

import jwt
from fastapi import Header, HTTPException, UploadFile
from jwt import PyJWKClient

ALLOWED_AUDIO_SUFFIXES = frozenset(
    {".wav", ".mp3", ".flac", ".m4a", ".ogg", ".aac", ".webm"}
)
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(50 * 1024 * 1024)))
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "").strip()
INFERENCE_API_KEY = os.getenv("INFERENCE_API_KEY", "").strip()
REQUIRE_INFERENCE_AUTH = os.getenv("REQUIRE_INFERENCE_AUTH", "false").lower() in ("1", "true", "yes")


@lru_cache(maxsize=1)
def _firebase_jwks() -> PyJWKClient:
    return PyJWKClient(
        "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
    )


def verify_firebase_bearer(authorization: str | None) -> str | None:
    if not FIREBASE_PROJECT_ID:
        return None
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        return None
    try:
        signing_key = _firebase_jwks().get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=FIREBASE_PROJECT_ID,
            issuer=f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}",
        )
        uid = payload.get("sub")
        return str(uid) if uid else None
    except Exception:
        return None


def require_inference_auth(
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
) -> None:
    """Allow server proxy (API key) or signed-in Firebase users (Bearer token)."""
    if not REQUIRE_INFERENCE_AUTH and not INFERENCE_API_KEY and not FIREBASE_PROJECT_ID:
        return

    if INFERENCE_API_KEY and x_api_key and x_api_key == INFERENCE_API_KEY:
        return

    if verify_firebase_bearer(authorization):
        return

    if not REQUIRE_INFERENCE_AUTH and not INFERENCE_API_KEY and not FIREBASE_PROJECT_ID:
        return

    raise HTTPException(status_code=401, detail="Unauthorized inference request.")


def validate_upload_filename(filename: str | None) -> str:
    if not filename or not filename.strip():
        raise HTTPException(status_code=400, detail="Missing audio filename.")
    suffix = Path(filename).suffix.lower() or ".wav"
    if suffix not in ALLOWED_AUDIO_SUFFIXES:
        allowed = ", ".join(sorted(ALLOWED_AUDIO_SUFFIXES))
        raise HTTPException(status_code=400, detail=f"Unsupported audio type. Allowed: {allowed}")
    return suffix


async def stream_upload_to_temp(upload: UploadFile, suffix: str) -> Path:
    total = 0
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        while True:
            chunk = await upload.read(1024 * 1024)
            if not chunk:
                break
            total += len(chunk)
            if total > MAX_UPLOAD_BYTES:
                tmp_path = Path(tmp.name)
                tmp.close()
                tmp_path.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=413,
                    detail=f"File exceeds {MAX_UPLOAD_BYTES // (1024 * 1024)} MB limit.",
                )
            tmp.write(chunk)
        return Path(tmp.name)


def analysis_reports_enabled() -> bool:
    """Generate PDF/JSON/waveform reports after successful authenticated analysis."""
    return os.getenv("ENABLE_ANALYSIS_REPORTS", "true").lower() in ("1", "true", "yes")


def production_report_flags_enabled() -> bool:
    """Legacy query-flag gate; kept for explicit API callers."""
    return os.getenv("ALLOW_SERVER_REPORT_GENERATION", "true").lower() in ("1", "true", "yes")
