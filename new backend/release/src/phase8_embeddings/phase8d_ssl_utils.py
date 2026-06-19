"""Phase 8D WavLM SSL utilities (vendored for standalone release/)."""

from __future__ import annotations

from typing import Any, Tuple

import librosa
import numpy as np
import torch
from transformers import AutoFeatureExtractor, AutoModel

TARGET_SR = 16000


def get_device(device: str = "auto") -> torch.device:
    if device == "auto":
        return torch.device("cuda" if torch.cuda.is_available() else "cpu")
    return torch.device(device)


def load_ssl_model_and_processor(
    model_name: str,
    device: torch.device,
    use_safetensors: bool = True,
) -> Tuple[Any, Any]:
    processor = AutoFeatureExtractor.from_pretrained(model_name)
    model = AutoModel.from_pretrained(model_name, use_safetensors=use_safetensors)
    model.to(device)
    model.eval()
    return model, processor


def _prepare_waveform(y: np.ndarray, sr: int) -> np.ndarray:
    y = np.asarray(y, dtype=np.float32).reshape(-1)
    if y.size == 0:
        return y
    if sr != TARGET_SR:
        y = librosa.resample(y, orig_sr=sr, target_sr=TARGET_SR)
    peak = float(np.max(np.abs(y)))
    if peak > 1.0:
        y = y / peak
    return y


def extract_ssl_embedding(
    y: np.ndarray,
    sr: int,
    feature_extractor: Any,
    model: Any,
    device: torch.device,
    pooling: str = "mean",
) -> np.ndarray:
    y = _prepare_waveform(y, sr)
    if y.size < 64:
        return np.full(768, np.nan, dtype=np.float64)

    inputs = feature_extractor(y, sampling_rate=TARGET_SR, return_tensors="pt", padding=True)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        outputs = model(**inputs)
    hidden = outputs.last_hidden_state
    if pooling == "mean":
        emb = hidden.mean(dim=1).squeeze(0)
    else:
        emb = hidden[:, 0, :].squeeze(0)
    return emb.detach().cpu().numpy().astype(np.float64)


def slice_audio(
    y: np.ndarray,
    sr: int,
    start_sec: float,
    end_sec: float,
) -> tuple[np.ndarray | None, str | None]:
    if y is None or len(y) == 0 or sr <= 0:
        return None, "empty_audio"
    start = max(0, int(float(start_sec) * sr))
    end = min(len(y), int(float(end_sec) * sr))
    if end <= start:
        return None, "invalid_slice"
    seg = np.asarray(y[start:end], dtype=np.float32)
    if len(seg) < 256:
        return None, "slice_too_short"
    return seg, None
