export type MicPlatform = "windows" | "mac" | "ios" | "android" | "other"

export type MicPermissionState = "unsupported" | "insecure" | "prompt" | "granted" | "denied" | "unknown"

export interface MicAccessError {
  code: string
  title: string
  message: string
  platform: MicPlatform
  steps: string[]
}

const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  channelCount: { ideal: 1 },
}

export function detectMicPlatform(): MicPlatform {
  if (typeof navigator === "undefined") return "other"
  const ua = navigator.userAgent
  const isIOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  if (isIOS) return "ios"
  if (/Android/i.test(ua)) return "android"
  if (/Win/i.test(navigator.platform)) return "windows"
  if (/Mac/i.test(navigator.platform)) return "mac"
  return "other"
}

export function isMicrophoneApiSupported(): boolean {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia
}

export function isSecureMicContext(): boolean {
  if (typeof window === "undefined") return false
  return window.isSecureContext
}

export interface MicDiagnostics {
  href: string
  protocol: string
  hostname: string
  secure: boolean
  isLocalhost: boolean
  isLanIp: boolean
  apiSupported: boolean
  likelyPopupBlockedReason: string | null
}

export function getMicDiagnostics(): MicDiagnostics | null {
  if (typeof window === "undefined") return null
  const { protocol, hostname, href } = window.location
  const isLocalhost =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost")
  const isLanIp = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname)

  let likelyPopupBlockedReason: string | null = null
  if (!window.isSecureContext && isLanIp) {
    likelyPopupBlockedReason =
      `You opened ${href}. LAN IP addresses are not secure. Use http://localhost:3000 instead.`
  } else if (!window.isSecureContext) {
    likelyPopupBlockedReason = "This page is not secure. Use http://localhost:3000 or HTTPS."
  } else if (!isMicrophoneApiSupported()) {
    likelyPopupBlockedReason = "This browser does not support microphone recording."
  }

  return {
    href,
    protocol,
    hostname,
    secure: window.isSecureContext,
    isLocalhost,
    isLanIp,
    apiSupported: isMicrophoneApiSupported(),
    likelyPopupBlockedReason,
  }
}

export async function queryMicrophonePermission(): Promise<MicPermissionState> {
  if (!isMicrophoneApiSupported()) return "unsupported"
  if (!isSecureMicContext()) return "insecure"

  try {
    const permissions = navigator.permissions
    if (!permissions?.query) return "unknown"
    const status = await permissions.query({ name: "microphone" as PermissionName })
    if (status.state === "granted") return "granted"
    if (status.state === "denied") return "denied"
    return "prompt"
  } catch {
    return "unknown"
  }
}

export function platformMicHelp(platform: MicPlatform): string[] {
  switch (platform) {
    case "windows":
      return [
        "Click the lock or site-info icon in the address bar → Site permissions → Microphone → Allow.",
        "Windows Settings → Privacy & security → Microphone → turn on microphone access for desktop apps and your browser.",
        "Close other apps using the mic (Zoom, Teams, Discord), then reload this page.",
        "Use Chrome, Edge, or Firefox (latest version), not an embedded IDE preview.",
      ]
    case "mac":
      return [
        "macOS System Settings → Privacy & Security → Microphone → enable your browser (Chrome, Safari, Firefox, Edge).",
        "In the browser address bar, open site settings and set Microphone to Allow for this site.",
        "Safari: Safari → Settings → Websites → Microphone → Allow for this site.",
        "Reload the page after changing permissions.",
      ]
    case "ios":
      return [
        "When prompted, tap Allow so the browser can use the microphone.",
        "iOS Settings → Safari (or Chrome) → Microphone → Allow while using the app.",
        "Or Settings → Privacy & Security → Microphone → enable your browser.",
        "Recording requires HTTPS. Use Safari or Chrome on iOS 14.3+.",
        "If blocked before, clear site data or reset permission in browser site settings, then try again.",
      ]
    case "android":
      return [
        "When prompted, tap Allow for microphone access.",
        "Chrome: tap lock icon → Permissions → Microphone → Allow.",
        "Android Settings → Apps → Chrome (or your browser) → Permissions → Microphone → Allow.",
        "Close other apps using the mic, then reload this page.",
        "Use HTTPS in production; localhost works for local testing.",
      ]
    default:
      return [
        "Allow microphone access in your browser site settings.",
        "Ensure the page is served over HTTPS (or localhost for development).",
        "Close other applications that may be using the microphone.",
        "Reload the page and tap Allow microphone again.",
      ]
  }
}

/** Steps when the browser will not show the popup again (permission already denied). */
export function permissionResetSteps(platform: MicPlatform): string[] {
  const common = [
    "The permission popup only appears the first time. If you clicked Block, the browser will not ask again until you reset site permissions.",
    "Open this site in Chrome, Edge, Firefox, or Safari. Embedded IDE previews often block microphone access.",
    "Use http://localhost:3000 or https://your-domain.com (not a plain http:// LAN IP).",
  ]
  switch (platform) {
    case "windows":
      return [
        ...common,
        "Chrome/Edge: click the tune or lock icon left of the address bar → Site settings → Microphone → Allow (or Reset permission).",
        "Then reload the page and click Allow microphone.",
      ]
    case "mac":
      return [
        ...common,
        "Chrome: click lock icon → Site settings → Microphone → Allow.",
        "Safari: Safari → Settings for This Website → Microphone → Allow.",
        "macOS System Settings → Privacy & Security → Microphone → enable your browser.",
      ]
    case "ios":
      return [
        ...common,
        "Settings → Safari → Microphone → Allow, or Settings → Chrome → Microphone → Allow.",
        "If still blocked: Settings → Safari → Advanced → Website Data → remove this site, then reload.",
      ]
    case "android":
      return [
        ...common,
        "Chrome: tap lock icon → Permissions → Microphone → Allow.",
        "Android Settings → Apps → Chrome → Permissions → Microphone → Allow only while using the app.",
      ]
    default:
      return [
        ...common,
        "Reset microphone permission for this site in browser site settings, then reload.",
      ]
  }
}

export function buildMicAccessError(err: unknown, platform: MicPlatform): MicAccessError {
  const name = err instanceof DOMException ? err.name : ""
  const steps = platformMicHelp(platform)

  if (!isMicrophoneApiSupported()) {
    return {
      code: "unsupported",
      title: "Microphone not supported",
      message: "This browser does not support in-page microphone recording. Try Chrome, Edge, Safari, or Firefox.",
      platform,
      steps,
    }
  }

  if (!isSecureMicContext()) {
    return {
      code: "insecure",
      title: "Secure connection required",
      message:
        "Microphone access only works on HTTPS or localhost. Open the site with https:// or test on http://localhost.",
      platform,
      steps,
    }
  }

  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return {
      code: "denied",
      title: "Microphone permission blocked",
      message:
        "The browser blocked microphone access. It will not show the popup again until you reset site permissions (see steps below), then reload.",
      platform,
      steps: permissionResetSteps(platform),
    }
  }

  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return {
      code: "not_found",
      title: "No microphone found",
      message: "No microphone was detected. Plug in or enable a mic, then try again.",
      platform,
      steps,
    }
  }

  if (name === "NotReadableError" || name === "TrackStartError") {
    return {
      code: "busy",
      title: "Microphone is busy",
      message: "Another app may be using the microphone. Close it and try again.",
      platform,
      steps,
    }
  }

  return {
    code: "unknown",
    title: "Could not access microphone",
    message: err instanceof Error ? err.message : "Microphone access failed.",
    platform,
    steps,
  }
}

export async function requestMicrophoneStream(): Promise<MediaStream> {
  if (!isMicrophoneApiSupported()) {
    throw new DOMException("Microphone API unsupported", "NotSupportedError")
  }
  if (!isSecureMicContext()) {
    const diag = getMicDiagnostics()
    const hint = diag?.isLanIp
      ? "Open http://localhost:3000 instead of the Network IP URL."
      : "Use localhost or HTTPS."
    throw new DOMException(`Insecure context: ${hint}`, "SecurityError")
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: AUDIO_CONSTRAINTS,
      video: false,
    })
  } catch (err) {
    // Fallback: some browsers fail advanced constraints before showing the popup.
    if (err instanceof DOMException && err.name === "OverconstrainedError") {
      return navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    }
    throw err
  }
}

/** Call synchronously inside a click handler so the browser shows the permission popup. */
export function requestMicrophoneStreamSync(): Promise<MediaStream> {
  if (!isMicrophoneApiSupported()) {
    return Promise.reject(new DOMException("Microphone API unsupported", "NotSupportedError"))
  }
  if (!isSecureMicContext()) {
    const diag = getMicDiagnostics()
    const hint = diag?.isLanIp
      ? "Open http://localhost:3000 instead of the Network IP URL."
      : "Use localhost or HTTPS."
    return Promise.reject(new DOMException(`Insecure context: ${hint}`, "SecurityError"))
  }
  return navigator.mediaDevices.getUserMedia({ audio: true, video: false })
}

export function platformLabel(platform: MicPlatform): string {
  switch (platform) {
    case "windows":
      return "Windows"
    case "mac":
      return "macOS"
    case "ios":
      return "iOS"
    case "android":
      return "Android"
    default:
      return "your device"
  }
}
