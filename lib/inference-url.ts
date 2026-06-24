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
  if (msg.includes("DIRECT_INFERENCE_UNREACHABLE")) {
    return [
      "The deployed frontend reached the direct inference API path, but the backend did not allow the browser request.",
      "Fix backend CORS first: set CORS_ALLOW_ORIGINS=https://www.deepfakedetection.dev,https://deepfakedetection.dev,https://your-vercel-preview-domain.vercel.app and restart/redeploy the backend.",
      "Do not rely on the Vercel proxy for generated/mixed audio because larger uploads can exceed Vercel's serverless body limit.",
    ].join(" ")
  }
  if (
    msg.includes("FUNCTION_PAYLOAD_TOO_LARGE") ||
    msg.includes("Request Entity Too Large") ||
    msg.includes("413")
  ) {
    return [
      "This audio file is too large for the Vercel upload proxy (about 4.5 MB max).",
      "Set INFERENCE_PROXY_TARGET on Vercel to your DigitalOcean API URL, redeploy,",
      "and ensure CORS_ALLOW_ORIGINS on the backend includes your site domain.",
    ].join(" ")
  }
  if (msg === "Failed to fetch" || msg.includes("NetworkError") || msg.includes("Load failed")) {
    const localHint =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? " For local dev: keep the backend running on port 8000, set INFERENCE_PROXY_TARGET=http://127.0.0.1:8000 in .env.local, restart npm run dev, and confirm http://127.0.0.1:8000/health returns ready_for_analyze: true."
        : ""
    return [
      "Cannot reach the inference API.",
      "1) Confirm the API is running and /health returns ready_for_analyze: true.",
      "2) On Vercel, set INFERENCE_PROXY_TARGET=https://api.yourdomain.com and redeploy.",
      "3) On the backend, set CORS_ALLOW_ORIGINS to your frontend domain.",
      localHint,
    ]
      .filter(Boolean)
      .join(" ")
  }
  return msg || "Unexpected error"
}
