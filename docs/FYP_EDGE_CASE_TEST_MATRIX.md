# FYP Edge-Case Test Matrix

This matrix documents how the app should respond to common panel-test uploads. The backend is the source of truth; frontend checks are only early user feedback.

| Case | Expected behavior | Enforcement |
| --- | --- | --- |
| Silent audio | Reject with `invalid_input_code=silence` | `src/audio_quality.py` RMS/peak gate |
| Mostly silent audio | Reject with `invalid_input_code=mostly_silence` | Active-duration and active-ratio gate |
| Audio under 5 seconds | Reject with `invalid_input_code=too_short` | Client metadata check + backend `MIN_AUDIO_DURATION_SEC` |
| Audio over 5 minutes | Reject with `invalid_input_code=too_long` | Backend `MAX_AUDIO_DURATION_SEC` |
| Ringtone / pure tone | Reject with `invalid_input_code=non_speech` | Speech-like variation + tone concentration gate |
| Animal/non-speech audio | Reject as `animal_voice` or `non_speech` when acoustic scope checks fail | Backend speech-band + animal-like heuristics |
| Valid speech-like audio | Allow into Phase 9 model inference | Backend preflight passes |
| WhatsApp `.amr` / `.3gp` | Decode through `ffmpeg`, then run same quality gates | `audio_io.py` ffmpeg fallback |
| Unsupported/corrupt codec | Return clear decode error; do not crash | `AudioLoadError` handling |
| Very large file | Reject with HTTP 413 | `MAX_UPLOAD_BYTES` stream cap |

## Generated Gate Check

Local validation was run against generated signals by monkeypatching the backend loader because this machine's Python environment did not have the full backend audio dependencies installed (`soundfile`/`librosa`). The gate logic produced:

| Generated input | Result |
| --- | --- |
| 10s silence | `silence` |
| 3s active clip | `too_short` |
| 10s 440 Hz tone | `non_speech` |
| 8s speech-like harmonic/noisy signal | `ok` |
| 301s active clip | `too_long` |

Before the final demo, also test with real files:

1. A real human speech clip between 5 and 20 seconds.
2. A WhatsApp voice note exported as `.amr` or `.3gp`.
3. A ringtone file.
4. A silent WAV.
5. A very short 3-4 second speech clip.
6. A long file over 5 minutes or over the configured upload cap.
