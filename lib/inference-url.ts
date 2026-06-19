/**
 * Inference base URL for browser fetch.
 * - Unset NEXT_PUBLIC_INFERENCE_URL → same-origin proxy (/api/inference) to avoid CORS.
 * - Set NEXT_PUBLIC_INFERENCE_URL → call that host directly (deployed API).
 */
export function getInferenceBase(): string {
  const direct = process.env.NEXT_PUBLIC_INFERENCE_URL?.trim()
  if (direct) return direct.replace(/\/$/, "")
  return "/api/inference"
}

export function inferenceFetchErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg === "Failed to fetch" || msg.includes("NetworkError") || msg.includes("Load failed")) {
    return [
      "Cannot reach the inference API.",
      "1) In new backend/release: activate .venv, pip install -r requirements_release.txt, run .\\run_fastapi.ps1 (port 8000).",
      "2) Restart npm run dev after changing next.config or .env.",
      "3) Or set NEXT_PUBLIC_INFERENCE_URL=http://localhost:8000 and add your frontend origin to CORS_ALLOW_ORIGINS (e.g. http://localhost:3001).",
    ].join(" ")
  }
  return msg || "Unexpected error"
}
