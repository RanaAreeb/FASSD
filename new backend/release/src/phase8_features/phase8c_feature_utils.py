"""Phase 8C acoustic feature utilities (vendored for standalone release/)."""

from __future__ import annotations

from typing import Any

import librosa
import numpy as np

# Union schema used at Phase 8E fit time (~60 acoustic columns).
FILE_FEATURE_NAMES: list[str] = [
    "rms_mean",
    "rms_std",
    "rms_min",
    "rms_max",
    "peak_amplitude",
    "mean_amplitude",
    "std_amplitude",
    "zero_crossing_rate_mean",
    "zero_crossing_rate_std",
    "clipping_ratio",
    "silence_ratio",
    "active_audio_ratio",
    "spectral_centroid_mean",
    "spectral_centroid_std",
    "spectral_bandwidth_mean",
    "spectral_bandwidth_std",
    "spectral_rolloff_mean",
    "spectral_rolloff_std",
    "spectral_flatness_mean",
    "spectral_flatness_std",
    "spectral_contrast_mean",
    "spectral_contrast_std",
    "low_band_energy_ratio",
    "mid_band_energy_ratio",
    "high_band_energy_ratio",
    "very_high_band_energy_ratio",
    "noise_floor_proxy",
    "snr_proxy",
    "dynamic_range_proxy",
    "spectral_entropy_mean",
    "spectral_entropy_std",
    "high_freq_rolloff_ratio",
    "bandwidth_occupied_95",
] + [f"mfcc_{i}_{stat}" for i in range(1, 14) for stat in ("mean", "std")]

SEGMENT_FEATURE_NAMES: list[str] = list(FILE_FEATURE_NAMES)

N_FFT = 2048
HOP = 512
N_MELS = 64
N_MFCC = 13
CLIP_THRESH = 0.99
SILENCE_DB = 40


def empty_feature_dict(names: list[str]) -> dict[str, float]:
    return {name: float("nan") for name in names}


def safe_audio_slice(
    y: np.ndarray,
    sr: int,
    start_sec: float,
    end_sec: float,
    min_samples: int = 256,
) -> tuple[np.ndarray | None, str | None]:
    if y is None or len(y) == 0 or sr <= 0:
        return None, "empty_audio"
    start = max(0, int(float(start_sec) * sr))
    end = min(len(y), int(float(end_sec) * sr))
    if end <= start:
        return None, "invalid_slice"
    seg = np.asarray(y[start:end], dtype=np.float32)
    if len(seg) < min_samples:
        return None, "slice_too_short"
    return seg, None


def _safe_stat(values: np.ndarray, fn: str) -> float:
    arr = np.asarray(values, dtype=np.float64)
    arr = arr[np.isfinite(arr)]
    if arr.size == 0:
        return float("nan")
    if fn == "mean":
        return float(np.mean(arr))
    if fn == "std":
        return float(np.std(arr))
    if fn == "min":
        return float(np.min(arr))
    if fn == "max":
        return float(np.max(arr))
    raise ValueError(fn)


def _band_energy_ratios(y: np.ndarray, sr: int) -> dict[str, float]:
    mel = librosa.feature.melspectrogram(y=y, sr=sr, n_fft=N_FFT, hop_length=HOP, n_mels=N_MELS)
    power = np.maximum(mel, 1e-12)
    freqs = librosa.mel_frequencies(n_mels=N_MELS, fmin=0.0, fmax=sr / 2.0)
    total = float(np.sum(power))
    if total <= 0:
        return {
            "low_band_energy_ratio": float("nan"),
            "mid_band_energy_ratio": float("nan"),
            "high_band_energy_ratio": float("nan"),
            "very_high_band_energy_ratio": float("nan"),
        }
    low = float(np.sum(power[freqs < 500]))
    mid = float(np.sum(power[(freqs >= 500) & (freqs < 4000)]))
    high = float(np.sum(power[(freqs >= 4000) & (freqs < 8000)]))
    vhigh = float(np.sum(power[freqs >= 8000]))
    return {
        "low_band_energy_ratio": low / total,
        "mid_band_energy_ratio": mid / total,
        "high_band_energy_ratio": high / total,
        "very_high_band_energy_ratio": vhigh / total,
    }


def _core_acoustic_dict(y: np.ndarray, sr: int) -> dict[str, float]:
    y = np.asarray(y, dtype=np.float32).reshape(-1)
    if y.size == 0:
        return empty_feature_dict(FILE_FEATURE_NAMES)

    rms = librosa.feature.rms(y=y, frame_length=N_FFT, hop_length=HOP)[0]
    zcr = librosa.feature.zero_crossing_rate(y, frame_length=N_FFT, hop_length=HOP)[0]
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr, n_fft=N_FFT, hop_length=HOP)[0]
    bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr, n_fft=N_FFT, hop_length=HOP)[0]
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr, n_fft=N_FFT, hop_length=HOP, roll_percent=0.85)[0]
    flatness = librosa.feature.spectral_flatness(y=y, n_fft=N_FFT, hop_length=HOP)[0]
    contrast = librosa.feature.spectral_contrast(y=y, sr=sr, n_fft=N_FFT, hop_length=HOP)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=N_MFCC, n_fft=N_FFT, hop_length=HOP)

    noise_floor = float(np.percentile(rms, 10)) if rms.size else 0.0
    peak_rms = float(np.max(rms)) if rms.size else 0.0
    silence_mask = rms < (noise_floor + 1e-9)
    silence_ratio = float(np.mean(silence_mask)) if rms.size else 1.0

    stft_power = np.abs(librosa.stft(y, n_fft=N_FFT, hop_length=HOP)) ** 2
    freqs = librosa.fft_frequencies(sr=sr, n_fft=N_FFT)
    total_power = float(np.sum(stft_power))
    hf_power = float(np.sum(stft_power[freqs >= 4000])) if total_power > 0 else 0.0

    spec_norm = stft_power / (np.sum(stft_power, axis=0, keepdims=True) + 1e-12)
    spectral_entropy = -np.sum(spec_norm * np.log(spec_norm + 1e-12), axis=0)

    feats: dict[str, float] = {
        "rms_mean": _safe_stat(rms, "mean"),
        "rms_std": _safe_stat(rms, "std"),
        "rms_min": _safe_stat(rms, "min"),
        "rms_max": _safe_stat(rms, "max"),
        "peak_amplitude": float(np.max(np.abs(y))),
        "mean_amplitude": float(np.mean(np.abs(y))),
        "std_amplitude": float(np.std(y)),
        "zero_crossing_rate_mean": _safe_stat(zcr, "mean"),
        "zero_crossing_rate_std": _safe_stat(zcr, "std"),
        "clipping_ratio": float(np.mean(np.abs(y) >= CLIP_THRESH)),
        "silence_ratio": silence_ratio,
        "active_audio_ratio": 1.0 - silence_ratio,
        "spectral_centroid_mean": _safe_stat(centroid, "mean"),
        "spectral_centroid_std": _safe_stat(centroid, "std"),
        "spectral_bandwidth_mean": _safe_stat(bandwidth, "mean"),
        "spectral_bandwidth_std": _safe_stat(bandwidth, "std"),
        "spectral_rolloff_mean": _safe_stat(rolloff, "mean"),
        "spectral_rolloff_std": _safe_stat(rolloff, "std"),
        "spectral_flatness_mean": _safe_stat(flatness, "mean"),
        "spectral_flatness_std": _safe_stat(flatness, "std"),
        "spectral_contrast_mean": float(np.mean(contrast)),
        "spectral_contrast_std": float(np.std(contrast)),
        "noise_floor_proxy": noise_floor,
        "snr_proxy": peak_rms / (noise_floor + 1e-9),
        "dynamic_range_proxy": _safe_stat(rms, "max") - _safe_stat(rms, "min"),
        "spectral_entropy_mean": _safe_stat(spectral_entropy, "mean"),
        "spectral_entropy_std": _safe_stat(spectral_entropy, "std"),
        "high_freq_rolloff_ratio": hf_power / (total_power + 1e-9),
        "bandwidth_occupied_95": _safe_stat(rolloff, "mean") / (sr / 2.0 + 1e-9),
    }
    feats.update(_band_energy_ratios(y, sr))

    for i in range(1, N_MFCC + 1):
        row = mfcc[i - 1]
        feats[f"mfcc_{i}_mean"] = _safe_stat(row, "mean")
        feats[f"mfcc_{i}_std"] = _safe_stat(row, "std")

    for name in FILE_FEATURE_NAMES:
        feats.setdefault(name, float("nan"))
    return feats


def extract_file_feature_dict(y: np.ndarray, sr: int) -> dict[str, float]:
    return _core_acoustic_dict(y, sr)


def extract_segment_feature_dict(y: np.ndarray, sr: int, mode: str = "full") -> dict[str, float]:
    _ = mode
    return _core_acoustic_dict(y, sr)
