import { getInferenceBase } from "@/lib/inference-url"
import { auth } from "@/lib/firebase"

const INFERENCE_TIMEOUT_MS = 10 * 60 * 1000
const VERCEL_SERVERLESS_BODY_LIMIT_BYTES = 4.5 * 1024 * 1024

export async function postAnalyze(file: File): Promise<Response> {
  const form = new FormData()
  form.append("file", file)

  const headers: HeadersInit = {}
  const user = auth?.currentUser
  if (user) {
    headers.Authorization = `Bearer ${await user.getIdToken()}`
  }

  const base = getInferenceBase()
  const doFetch = (targetBase: string) =>
    fetch(`${targetBase}/analyze-audio`, {
      method: "POST",
      body: form,
      headers,
      signal: AbortSignal.timeout(INFERENCE_TIMEOUT_MS),
    })

  try {
    return await doFetch(base)
  } catch (err) {
    // Deployed direct-host calls can fail on DNS/CORS/TLS. Retry same-origin proxy once.
    if (base !== "/api/inference") {
      if (file.size > VERCEL_SERVERLESS_BODY_LIMIT_BYTES) {
        throw new Error(
          "DIRECT_INFERENCE_UNREACHABLE_LARGE_UPLOAD: The browser could not reach the direct inference API, and this file is too large for the Vercel fallback proxy. Fix backend CORS for your deployed frontend domain.",
        )
      }
      try {
        const fallback = await doFetch("/api/inference")
        if (fallback.status === 413) {
          throw new Error(
            "DIRECT_INFERENCE_UNREACHABLE_PROXY_TOO_LARGE: Direct inference failed, then the Vercel fallback rejected the upload size. Fix backend CORS for your deployed frontend domain.",
          )
        }
        return fallback
      } catch (fallbackErr) {
        if (
          fallbackErr instanceof Error &&
          fallbackErr.message.startsWith("DIRECT_INFERENCE_UNREACHABLE")
        ) {
          throw fallbackErr
        }
        // Preserve original error message for user-facing diagnostics.
      }
    }
    throw err
  }
}

export async function readInferenceError(resp: Response): Promise<string> {
  const raw = await resp.text()
  if (
    resp.status === 413 ||
    raw.includes("FUNCTION_PAYLOAD_TOO_LARGE") ||
    raw.includes("Request Entity Too Large")
  ) {
    return [
      "This audio file is too large for the Vercel upload proxy (about 4.5 MB max).",
      "Set INFERENCE_PROXY_TARGET on Vercel to your DigitalOcean API URL, redeploy,",
      "and ensure CORS_ALLOW_ORIGINS on the backend includes your site domain.",
    ].join(" ")
  }
  if (resp.status === 401) {
    return "You must be signed in to run analysis. Please sign in and try again."
  }
  try {
    const data = JSON.parse(raw) as {
      error_message?: string
      detail?: string | { msg?: string }[]
    }
    if (data.error_message) return data.error_message
    if (typeof data.detail === "string") return data.detail
    if (Array.isArray(data.detail)) {
      return data.detail.map((d) => d.msg ?? JSON.stringify(d)).join("; ")
    }
  } catch {
    // not JSON (e.g. HTML error page)
  }
  if (raw.length > 500) return `Inference request failed (${resp.status})`
  return raw
}

export async function fetchAnalysisReportJson(caseId: string): Promise<Record<string, unknown>> {
  const user = auth?.currentUser
  if (!user) {
    throw new Error("You must be signed in to view reports.")
  }

  const headers: HeadersInit = {
    Authorization: `Bearer ${await user.getIdToken()}`,
  }

  const response = await fetch(
    `${getInferenceBase()}/reports/${encodeURIComponent(caseId)}/json`,
    { headers, signal: AbortSignal.timeout(INFERENCE_TIMEOUT_MS) },
  )

  if (!response.ok) {
    throw new Error(await readInferenceError(response))
  }

  return (await response.json()) as Record<string, unknown>
}

export async function downloadAnalysisReport(caseId: string, kind: "pdf" | "json"): Promise<void> {
  const user = auth?.currentUser
  if (!user) {
    throw new Error("You must be signed in to download reports.")
  }

  const headers: HeadersInit = {
    Authorization: `Bearer ${await user.getIdToken()}`,
  }

  const response = await fetch(
    `${getInferenceBase()}/reports/${encodeURIComponent(caseId)}/${kind}`,
    { headers, signal: AbortSignal.timeout(INFERENCE_TIMEOUT_MS) },
  )

  if (!response.ok) {
    throw new Error(await readInferenceError(response))
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const extension = kind === "pdf" ? (blob.type.includes("html") ? "html" : "pdf") : "json"
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `${caseId}_report.${extension}`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
