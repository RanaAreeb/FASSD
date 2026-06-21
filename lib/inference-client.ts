import { getInferenceBase } from "@/lib/inference-url"

const INFERENCE_TIMEOUT_MS = 10 * 60 * 1000

export async function postAnalyze(file: File): Promise<Response> {
  const form = new FormData()
  form.append("file", file)
  return fetch(`${getInferenceBase()}/analyze`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(INFERENCE_TIMEOUT_MS),
  })
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
  if (!raw) return `Inference request failed (${resp.status})`
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
