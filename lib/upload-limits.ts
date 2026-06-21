/** Client-side audio upload limits (mirrors backend defaults). */

export const MAX_AUDIO_BYTES = 50 * 1024 * 1024

export const ALLOWED_AUDIO_EXTENSIONS = [".wav", ".mp3", ".flac", ".m4a", ".ogg", ".aac", ".webm"] as const

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
