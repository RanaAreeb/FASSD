"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Mic, RefreshCw, ShieldAlert, Square } from "lucide-react"
import { MIN_AUDIO_DURATION_SECONDS } from "@/lib/upload-limits"
import { blobToWavFile } from "@/lib/audio-mixer"
import {
  buildMicAccessError,
  detectMicPlatform,
  getMicDiagnostics,
  isSecureMicContext,
  permissionResetSteps,
  platformLabel,
  platformMicHelp,
  queryMicrophonePermission,
  requestMicrophoneStreamSync,
  type MicAccessError,
  type MicPermissionState,
  type MicPlatform,
} from "@/lib/microphone-access"

const RECORD_READ_ALOUD_SCRIPT = `Hello, this is a voice integrity screening test. I am recording my own speech so the system can check for signs of synthetic audio, replay artifacts, or edited segments. I will speak at a normal pace, in a quiet room, without background music or animal sounds. This recording is only for demonstration and manual review — not a legal verdict.`

interface AudioRecorderProps {
  onRecorded: (file: File) => void
  disabled?: boolean
}

export function AudioRecorder({ onRecorded, disabled }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [accessError, setAccessError] = useState<MicAccessError | null>(null)
  const [permissionState, setPermissionState] = useState<MicPermissionState>("unknown")
  const [platform] = useState<MicPlatform>(() => detectMicPlatform())
  const [checkingPermission, setCheckingPermission] = useState(false)
  const [requestingAccess, setRequestingAccess] = useState(false)
  const [micReady, setMicReady] = useState(false)
  const [diag] = useState(() => getMicDiagnostics())
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)
  const secondsRef = useRef(0)

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setMicReady(false)
  }, [])

  const refreshPermissionState = useCallback(async () => {
    setCheckingPermission(true)
    try {
      const state = await queryMicrophonePermission()
      setPermissionState(state)
      if (state === "granted") {
        setAccessError(null)
        setError(null)
      }
      if (state === "denied") {
        setMicReady(false)
      }
    } finally {
      setCheckingPermission(false)
    }
  }, [])

  useEffect(() => {
    void refreshPermissionState()
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      stopTracks()
    }
  }, [refreshPermissionState, stopTracks])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  /** Step 1 — must call getUserMedia synchronously on click or the popup may not appear. */
  const allowMicrophone = useCallback(() => {
    setError(null)
    setAccessError(null)

    if (diag?.likelyPopupBlockedReason) {
      setAccessError({
        code: "insecure",
        title: "Microphone popup cannot appear on this URL",
        message: diag.likelyPopupBlockedReason,
        platform,
        steps: permissionResetSteps(platform),
      })
      return
    }

    setRequestingAccess(true)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setMicReady(false)

    requestMicrophoneStreamSync()
      .then((stream) => {
        streamRef.current = stream
        setMicReady(true)
        setPermissionState("granted")
        setAccessError(null)
      })
      .catch((err) => {
        const details = buildMicAccessError(err, platform)
        setAccessError(details)
        setPermissionState(details.code === "denied" ? "denied" : "unknown")
        setMicReady(false)
      })
      .finally(() => setRequestingAccess(false))
  }, [diag, platform])

  const startRecording = useCallback(() => {
    setError(null)
    setAccessError(null)
    const begin = (stream: MediaStream) => {
      const mimeCandidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ]
      const mimeType = mimeCandidates.find((type) => MediaRecorder.isTypeSupported(type))
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        void (async () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" })
          stopTracks()
          const recordedSeconds = secondsRef.current
          if (recordedSeconds < MIN_AUDIO_DURATION_SECONDS) {
            setError(
              `Recording is too short (${recordedSeconds}s). Please record at least ${MIN_AUDIO_DURATION_SECONDS} seconds.`,
            )
            setSeconds(0)
            secondsRef.current = 0
            return
          }
          try {
            const wavFile = await blobToWavFile(blob, `recording_${Date.now()}.wav`)
            onRecorded(wavFile)
            setSeconds(0)
            secondsRef.current = 0
          } catch {
            setError("Could not prepare your recording for analysis. Try again or upload a WAV/MP3 file.")
          }
        })()
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setRecording(true)
      setSeconds(0)
      secondsRef.current = 0
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          const next = s + 1
          secondsRef.current = next
          return next
        })
      }, 1000)
    }

    if (streamRef.current && micReady) {
      begin(streamRef.current)
      return
    }

    setRequestingAccess(true)
    requestMicrophoneStreamSync()
      .then((stream) => {
        streamRef.current = stream
        setMicReady(true)
        setPermissionState("granted")
        setAccessError(null)
        begin(stream)
      })
      .catch((err) => {
        const details = buildMicAccessError(err, platform)
        setAccessError(details)
        setPermissionState(details.code === "denied" ? "denied" : "unknown")
      })
      .finally(() => setRequestingAccess(false))
  }, [micReady, onRecorded, platform, stopTracks])

  const insecure = !isSecureMicContext()
  const lanBlocked = Boolean(diag?.isLanIp && !diag?.secure)
  const popupBlocked = permissionState === "denied"

  const openOnLocalhost = useCallback(() => {
    if (typeof window === "undefined" || !diag) return
    const url = new URL(window.location.href)
    url.hostname = "localhost"
    window.location.assign(url.toString())
  }, [diag])

  return (
    <div className="space-y-4 text-left">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Record yourself for a quick live test. Read the paragraph below aloud — aim for at least{" "}
        {MIN_AUDIO_DURATION_SECONDS} seconds of clear human speech.
      </p>

      {lanBlocked && (
        <div className="rounded-lg border-2 border-red-500/60 bg-red-500/15 px-4 py-4 text-sm text-red-50 leading-relaxed space-y-3">
          <p className="font-semibold text-red-100">No microphone popup on this address</p>
          <p>
            You are on <span className="font-mono text-red-100">{diag?.href}</span>. Browsers treat LAN IPs as
            insecure and <strong>will not show</strong> the Allow/Block microphone popup.
          </p>
          <p>
            Switch to <span className="font-mono font-medium text-red-100">http://localhost:3000</span> on this
            same computer, then click Allow microphone again.
          </p>
          <Button type="button" size="sm" variant="secondary" onClick={openOnLocalhost}>
            Open on localhost
          </Button>
        </div>
      )}

      {insecure && !lanBlocked && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100/90 leading-relaxed">
          Microphone needs a <strong>secure page</strong>. Open{" "}
          <span className="font-mono">http://localhost:3000</span> or your HTTPS domain — not plain HTTP on a
          non-localhost host. The browser will not show a permission popup on insecure pages.
        </div>
      )}

      {diag && (
        <p className="text-[11px] text-muted-foreground font-mono break-all">
          Page: {diag.href} · secure: {diag.secure ? "yes" : "no"}
        </p>
      )}

      <div className="rounded-lg border border-border/50 bg-muted/15 px-4 py-3 text-xs text-muted-foreground space-y-3">
        <p>
          <span className="font-medium text-foreground">Device:</span> {platformLabel(platform)}
        </p>

        {popupBlocked ? (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-amber-100/90 space-y-2">
            <p className="font-medium text-amber-100">Why is there no popup?</p>
            <p>
              You previously blocked the microphone for this site. Browsers do not show the Allow/Block popup again until
              you reset site permissions manually.
            </p>
            <ol className="list-decimal pl-4 space-y-1">
              {permissionResetSteps(platform).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        ) : micReady ? (
          <p className="flex items-center gap-2 text-emerald-300/90">
            <CheckCircle2 className="w-4 h-4" />
            Microphone is allowed. You can start recording.
          </p>
        ) : permissionState === "granted" ? (
          <p className="flex items-center gap-2 text-emerald-300/90">
            <CheckCircle2 className="w-4 h-4" />
            Browser permission is allowed. Click Start recording to open the mic.
          </p>
        ) : (
          <p>
            <span className="font-medium text-foreground">Step 1:</span> Click{" "}
            <span className="font-medium">Allow microphone</span> — your browser should show an Allow / Block popup.
            Choose <span className="font-medium">Allow</span>.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={disabled || requestingAccess}
            onClick={allowMicrophone}
          >
            <Mic className="w-3.5 h-3.5 mr-1.5" />
            {requestingAccess ? "Waiting for browser…" : "Allow microphone"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || checkingPermission}
            onClick={() => void refreshPermissionState()}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${checkingPermission ? "animate-spin" : ""}`} />
            Refresh status
          </Button>
        </div>
      </div>

      <div
        className={`rounded-xl border px-4 py-4 text-sm leading-relaxed ${
          recording
            ? "border-primary/50 bg-primary/5 text-foreground"
            : "border-border/60 bg-muted/20 text-muted-foreground"
        }`}
      >
        <p className="text-[10px] uppercase tracking-wider font-medium text-primary/80 mb-2">
          Read aloud while recording
        </p>
        <p className="text-foreground/90">{RECORD_READ_ALOUD_SCRIPT}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {!recording ? (
          <Button
            type="button"
            onClick={startRecording}
            disabled={disabled || insecure || requestingAccess}
          >
            <Mic className="w-4 h-4 mr-2" />
            {requestingAccess ? "Opening microphone..." : "Step 2: Start recording"}
          </Button>
        ) : (
          <Button type="button" variant="destructive" onClick={stopRecording}>
            <Square className="w-4 h-4 mr-2" />
            Stop ({seconds}s)
          </Button>
        )}
        {recording && (
          <span className="text-xs font-mono text-primary animate-pulse">Recording… speak clearly</span>
        )}
      </div>

      {!micReady && !popupBlocked && !insecure && (
        <p className="text-[11px] text-muted-foreground">
          Tip: use Chrome, Edge, or Firefox at localhost. Some embedded IDE browsers never show the microphone popup.
        </p>
      )}

      {error && <p className="text-xs text-red-300/90">{error}</p>}

      {accessError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
          <div className="flex gap-2">
            <ShieldAlert className="w-4 h-4 text-red-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-100">{accessError.title}</p>
              <p className="text-xs text-red-200/90 mt-1 leading-relaxed">{accessError.message}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-red-100 mb-2">
              How to fix on {platformLabel(accessError.platform)}:
            </p>
            <ol className="text-xs text-red-200/90 space-y-1.5 list-decimal pl-4 leading-relaxed">
              {accessError.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer">Other platforms</summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(["windows", "mac", "ios", "android"] as MicPlatform[]).map((p) => (
                <div key={p} className="rounded-lg border border-border/40 p-3">
                  <p className="font-medium text-foreground mb-1">{platformLabel(p)}</p>
                  <ul className="space-y-1 list-disc pl-4">
                    {platformMicHelp(p).map((step) => (
                      <li key={`${p}-${step}`}>{step}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}
