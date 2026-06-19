"""Resolve vendored Phase 8 helper modules inside release/."""

from __future__ import annotations

import sys
from pathlib import Path

from .utils import release_root


def _ensure_on_path(path: Path) -> None:
    s = str(path)
    if s not in sys.path:
        sys.path.insert(0, s)


def import_phase8c_feature_utils():
    vendored = release_root() / "src" / "phase8_features"
    legacy = release_root().parent / "code" / "phase8" / "features"
    for directory in (vendored, legacy):
        if directory.is_dir():
            _ensure_on_path(directory)
            try:
                import phase8c_feature_utils as p8c  # type: ignore

                return p8c
            except Exception:
                continue
    raise RuntimeError(
        "phase8c_feature_utils not found. Expected release/src/phase8_features/phase8c_feature_utils.py"
    )


def import_phase8d_ssl_utils():
    vendored = release_root() / "src" / "phase8_embeddings"
    legacy = release_root().parent / "code" / "phase8" / "embeddings"
    for directory in (vendored, legacy):
        if directory.is_dir():
            _ensure_on_path(directory)
            try:
                import phase8d_ssl_utils as p8d  # type: ignore

                return p8d
            except Exception:
                continue
    raise RuntimeError(
        "phase8d_ssl_utils not found. Expected release/src/phase8_embeddings/phase8d_ssl_utils.py"
    )


def import_phase8f_fusion_rules():
    vendored = release_root() / "src" / "phase8_fusion"
    legacy = release_root().parent / "code" / "phase8" / "fusion"
    for directory in (vendored, legacy):
        if directory.is_dir():
            _ensure_on_path(directory)
            try:
                import phase8f_fusion_rules as p8f  # type: ignore

                return p8f
            except Exception:
                continue
    raise RuntimeError(
        "phase8f_fusion_rules not found. Expected release/src/phase8_fusion/phase8f_fusion_rules.py"
    )
