/** Client-side audio upload limits (mirrors backend defaults). */

export const MAX_AUDIO_BYTES = 50 * 1024 * 1024
export const MIN_AUDIO_DURATION_SECONDS = 5
export const MAX_AUDIO_DURATION_SECONDS = 5 * 60

/** Mirrors backend audio_quality.py gates for live recordings. */
export const SILENCE_RMS_THRESHOLD = 0.003
export const MIN_ACTIVE_AUDIO_SECONDS = 2
export const MIN_ACTIVE_RATIO = 0.08

export interface AudioActivityMetrics {
  durationSec: number
  rms: number
  peakAmplitude: number
  activeRatio: number
  activeDurationSec: number
}

export const ALLOWED_AUDIO_EXTENSIONS = [
  ".wav",
  ".mp3",
  ".flac",
  ".m4a",
  ".ogg",
  ".aac",
  ".webm",
  ".amr",
  ".3gp",
  ".3gpp",
] as const

const CLIENT_DECODABLE_EXTENSIONS = [".wav", ".mp3", ".flac", ".m4a", ".ogg", ".aac", ".webm"] as const

export function validateAudioFile(file: File): string | null {
  if (file.size > MAX_AUDIO_BYTES) {
    return `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum is ${MAX_AUDIO_BYTES / (1024 * 1024)} MB.`
  }

  const name = file.name.toLowerCase()
  const hasAllowedExt = ALLOWED_AUDIO_EXTENSIONS.some((ext) => name.endsWith(ext))
  const hasAudioMime = file.type.startsWith("audio/") || file.type === "application/ogg"

  if (!hasAllowedExt && !hasAudioMime) {
    return `Unsupported file type. Allowed: ${ALLOWED_AUDIO_EXTENSIONS.join(", ")}`
  }

  return null
}

export function isClientDecodableAudio(file: File): boolean {
  const name = file.name.toLowerCase()
  return CLIENT_DECODABLE_EXTENSIONS.some((ext) => name.endsWith(ext))
}

export async function readAudioDuration(file: File): Promise<number | null> {
  if (!isClientDecodableAudio(file)) return null

  const url = URL.createObjectURL(file)
  try {
    return await new Promise<number | null>((resolve) => {
      const audio = document.createElement("audio")
      const cleanup = () => {
        audio.removeAttribute("src")
        audio.load()
      }
      audio.preload = "metadata"
      audio.onloadedmetadata = () => {
        const duration = Number.isFinite(audio.duration) ? audio.duration : null
        cleanup()
        resolve(duration)
      }
      audio.onerror = () => {
        cleanup()
        resolve(null)
      }
      audio.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

function frameSignal(samples: Float32Array, frameSize: number, hopSize: number): Float32Array[] {
  if (samples.length < frameSize) return [samples]
  const frames: Float32Array[] = []
  for (let start = 0; start + frameSize <= samples.length; start += hopSize) {
    frames.push(samples.subarray(start, start + frameSize))
  }
  return frames.length > 0 ? frames : [samples]
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))
  return sorted[index]
}

/** Decode audio and measure speech activity (RMS / active frames). */
export async function measureAudioActivity(file: File): Promise<AudioActivityMetrics | null> {
  if (!isClientDecodableAudio(file)) return null

  const ctx = new AudioContext()
  try {
    const buffer = await ctx.decodeAudioData(await file.arrayBuffer())
    const channel = buffer.numberOfChannels > 0 ? buffer.getChannelData(0) : new Float32Array()
    const sr = buffer.sampleRate
    const durationSec = channel.length / sr

    let peakAmplitude = 0
    let sumSquares = 0
    for (let i = 0; i < channel.length; i++) {
      const sample = Math.abs(channel[i])
      if (sample > peakAmplitude) peakAmplitude = sample
      sumSquares += channel[i] * channel[i]
    }
    const rms = channel.length > 0 ? Math.sqrt(sumSquares / channel.length) : 0

    const frameSize = Math.max(Math.floor(0.025 * sr), 1)
    const hopSize = Math.max(Math.floor(0.01 * sr), 1)
    const frames = frameSignal(channel, frameSize, hopSize)
    const frameRms = frames.map((frame) => {
      let frameSum = 0
      for (let i = 0; i < frame.length; i++) frameSum += frame[i] * frame[i]
      return Math.sqrt(frameSum / frame.length)
    })
    const dynamicThreshold = Math.max(SILENCE_RMS_THRESHOLD, percentile(frameRms, 95) * 0.08)
    const activeFrames = frameRms.filter((value) => value >= dynamicThreshold).length
    const activeRatio = frameRms.length > 0 ? activeFrames / frameRms.length : 0

    return {
      durationSec,
      rms,
      peakAmplitude,
      activeRatio,
      activeDurationSec: activeRatio * durationSec,
    }
  } catch {
    return null
  } finally {
    await ctx.close()
  }
}

/** Return a user-facing error when a recording is silent or has too little speech. */
export function validateRecordingSpeech(metrics: AudioActivityMetrics): string | null {
  if (metrics.peakAmplitude < 1e-4 || metrics.rms < SILENCE_RMS_THRESHOLD) {
    return "Your recording is empty or silent. Speak clearly into the microphone and try again."
  }
  if (metrics.activeRatio < MIN_ACTIVE_RATIO || metrics.activeDurationSec < MIN_ACTIVE_AUDIO_SECONDS) {
    return "Your recording is mostly silent. Read the paragraph aloud with a clear voice and try again."
  }
  return null
}

export async function validateAudioFileForUpload(file: File): Promise<string | null> {
  const basicError = validateAudioFile(file)
  if (basicError) return basicError

  const duration = await readAudioDuration(file)
  if (duration == null) return null

  if (duration < MIN_AUDIO_DURATION_SECONDS) {
    return `Audio is too short (${duration.toFixed(1)}s). Please upload at least ${MIN_AUDIO_DURATION_SECONDS}s of speech.`
  }

  if (duration > MAX_AUDIO_DURATION_SECONDS) {
    return `Audio is too long (${Math.ceil(duration / 60)} min). Please upload a clip under ${MAX_AUDIO_DURATION_SECONDS / 60} minutes to avoid slow or unstable analysis.`
  }

  return null
}
