/** @type {import('next').NextConfig} */
const inferenceProxyTarget = (process.env.INFERENCE_PROXY_TARGET || "").replace(/\/$/, "")

function isLocalInferenceTarget(url) {
  if (!url) return false
  try {
    const { hostname } = new URL(url.includes("://") ? url : `http://${url}`)
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"
  } catch {
    return false
  }
}

// Local backend: browser uses same-origin /api/inference proxy (no CORS).
// Production: browser uploads directly to the API host (avoids Vercel 4.5 MB limit).
const clientInferenceUrl =
  process.env.NEXT_PUBLIC_INFERENCE_URL?.trim() ||
  (isLocalInferenceTarget(inferenceProxyTarget) ? "" : inferenceProxyTarget)

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // On Vercel, audio uploads cannot pass through the /api/inference proxy (4.5 MB limit).
  // Mirror INFERENCE_PROXY_TARGET into the client bundle so the browser uploads directly
  // to DigitalOcean when NEXT_PUBLIC_INFERENCE_URL is not set explicitly.
  env: {
    NEXT_PUBLIC_INFERENCE_URL: clientInferenceUrl.replace(/\/$/, ""),
  },
}

export default nextConfig
