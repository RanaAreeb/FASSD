"""Pre-inference audio quality gates for demo-safe uploads."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np

from .audio_io import load_audio

MIN_AUDIO_DURATION_SEC = float(os.getenv("MIN_AUDIO_DURATION_SEC", "5"))
MAX_AUDIO_DURATION_SEC = float(os.getenv("MAX_AUDIO_DURATION_SEC", str(5 * 60)))
MIN_ACTIVE_AUDIO_SEC = float(os.getenv("MIN_ACTIVE_AUDIO_SEC", "2"))
SILENCE_RMS_THRESHOLD = float(os.getenv("SILENCE_RMS_THRESHOLD", "0.003"))
MIN_ACTIVE_RATIO = float(os.getenv("MIN_ACTIVE_RATIO", "0.08"))
MIN_SPEECH_LIKE_RATIO = float(os.getenv("MIN_SPEECH_LIKE_RATIO", "0.10"))
MAX_TONE_LIKE_RATIO = float(os.getenv("MAX_TONE_LIKE_RATIO", "0.95"))
MIN_SPEECH_BAND_RATIO = float(os.getenv("MIN_SPEECH_BAND_RATIO", "0.32"))
MAX_ANIMAL_LIKE_RATIO = float(os.getenv("MAX_ANIMAL_LIKE_RATIO", "0.50"))
SPEECH_BAND_LOW_HZ = 300.0
SPEECH_BAND_HIGH_HZ = 3400.0


@dataclass
class InvalidAudioInput(Exception):
    code: str
    message: str
    metadata: dict[str, Any]


def _frame_signal(y: np.ndarray, frame_size: int, hop_size: int) -> np.ndarray:
    if len(y) < frame_size:
        return y.reshape(1, -1)
    count = 1 + (len(y) - frame_size) // hop_size
    shape = (count, frame_size)
    strides = (y.strides[0] * hop_size, y.strides[0])
    return np.lib.stride_tricks.as_strided(y, shape=shape, strides=strides)


def _quality_metrics(y: np.ndarray, sr: int) -> dict[str, Any]:
    duration = float(len(y) / sr) if sr > 0 else 0.0
    frame_size = max(int(0.025 * sr), 1)
    hop_size = max(int(0.010 * sr), 1)
    frames = _frame_signal(y, frame_size, hop_size)
    rms = np.sqrt(np.mean(np.square(frames), axis=1))
    peak = float(np.max(np.abs(y))) if len(y) else 0.0
    global_rms = float(np.sqrt(np.mean(np.square(y)))) if len(y) else 0.0

    dynamic_threshold = max(SILENCE_RMS_THRESHOLD, float(np.percentile(rms, 95)) * 0.08)
    active = rms >= dynamic_threshold
    active_ratio = float(np.mean(active)) if len(active) else 0.0
    active_duration = active_ratio * duration

    speech_like_ratio = 0.0
    tone_like_ratio = 0.0
    animal_like_ratio = 0.0
    speech_band_ratio = 0.0
    if active.any():
        active_frames = frames[active]
        zero_crossings = np.mean(np.abs(np.diff(np.signbit(active_frames), axis=1)), axis=1)
        # Human speech usually has broad-band voiced/unvoiced variation; pure tones and
        # background hums tend to sit at the extremes of this simple live-safe heuristic.
        speech_like = (zero_crossings >= 0.01) & (zero_crossings <= 0.35)
        speech_like_ratio = float(np.mean(speech_like))
        spectrum = np.abs(np.fft.rfft(active_frames, axis=1)) ** 2
        total_energy = np.sum(spectrum, axis=1) + 1e-12
        dominant_bin_ratio = np.max(spectrum, axis=1) / total_energy
        tone_like_ratio = float(np.mean(dominant_bin_ratio > 0.55))

        freqs = np.fft.rfftfreq(active_frames.shape[1], d=1.0 / sr)
        speech_mask = (freqs >= SPEECH_BAND_LOW_HZ) & (freqs <= SPEECH_BAND_HIGH_HZ)
        speech_energy = np.sum(spectrum[:, speech_mask], axis=1)
        speech_band_ratio = float(np.mean(speech_energy / total_energy))
        centroid = np.sum(spectrum * freqs, axis=1) / total_energy

        animal_like = (
            (speech_energy / total_energy < MIN_SPEECH_BAND_RATIO)
            | ((zero_crossings > 0.28) & (speech_energy / total_energy < 0.42))
            | ((centroid > 4200) & (speech_energy / total_energy < 0.48))
            | ((zero_crossings > 0.36) & ~speech_like)
        )
        animal_like_ratio = float(np.mean(animal_like))

    return {
        "duration_sec": round(duration, 4),
        "sample_rate": int(sr),
        "peak_amplitude": round(peak, 6),
        "rms": round(global_rms, 6),
        "active_ratio": round(active_ratio, 4),
        "active_duration_sec": round(active_duration, 4),
        "speech_like_ratio": round(speech_like_ratio, 4),
        "tone_like_ratio": round(tone_like_ratio, 4),
        "speech_band_ratio": round(speech_band_ratio, 4),
        "animal_like_ratio": round(animal_like_ratio, 4),
    }


def _raise_invalid(code: str, message: str, metrics: dict[str, Any]) -> None:
    raise InvalidAudioInput(code=code, message=message, metadata=metrics)


def validate_audio_for_inference(path: Path | str) -> dict[str, Any]:
    """Decode once and reject inputs that would produce misleading or unstable inference."""
    y, sr = load_audio(str(path))
    metrics = _quality_metrics(y, sr)
    duration = float(metrics["duration_sec"])

    if duration < MIN_AUDIO_DURATION_SEC:
        _raise_invalid(
            "too_short",
            f"Audio is too short for reliable analysis. Upload at least {MIN_AUDIO_DURATION_SEC:g} seconds of speech.",
            metrics,
        )

    if duration > MAX_AUDIO_DURATION_SEC:
        _raise_invalid(
            "too_long",
            f"Audio is too long for this demo. Upload a clip under {MAX_AUDIO_DURATION_SEC / 60:g} minutes.",
            metrics,
        )

    if metrics["peak_amplitude"] < 1e-4 or metrics["rms"] < SILENCE_RMS_THRESHOLD:
        _raise_invalid(
            "silence",
            "The file appears silent or nearly silent. Upload a clear speech recording.",
            metrics,
        )

    if metrics["active_ratio"] < MIN_ACTIVE_RATIO or metrics["active_duration_sec"] < MIN_ACTIVE_AUDIO_SEC:
        _raise_invalid(
            "mostly_silence",
            "The recording has too little usable speech/audio for analysis. Trim silence or upload a clearer clip.",
            metrics,
        )

    if metrics["animal_like_ratio"] > MAX_ANIMAL_LIKE_RATIO and metrics["speech_like_ratio"] < 0.22:
        _raise_invalid(
            "animal_voice",
            "Animal and other non-human sounds are out of scope. This system only analyzes human speech recordings.",
            metrics,
        )

    if metrics["speech_like_ratio"] < MIN_SPEECH_LIKE_RATIO or metrics["tone_like_ratio"] > MAX_TONE_LIKE_RATIO:
        _raise_invalid(
            "non_speech",
            "This does not look like a human speech recording. Ringtones, tones, and background noise are not valid inputs.",
            metrics,
        )

    return metrics
