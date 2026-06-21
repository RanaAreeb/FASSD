/** @type {import('next').NextConfig} */
const inferenceProxyTarget = (process.env.INFERENCE_PROXY_TARGET || "").replace(/\/$/, "")

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
    NEXT_PUBLIC_INFERENCE_URL:
      (process.env.NEXT_PUBLIC_INFERENCE_URL || inferenceProxyTarget || "").replace(/\/$/, ""),
  },
}

export default nextConfig
