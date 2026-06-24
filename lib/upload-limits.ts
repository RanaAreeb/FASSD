/** Client-side audio upload limits (mirrors backend defaults). */

export const MAX_AUDIO_BYTES = 50 * 1024 * 1024
export const MIN_AUDIO_DURATION_SECONDS = 5
export const MAX_AUDIO_DURATION_SECONDS = 5 * 60

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
