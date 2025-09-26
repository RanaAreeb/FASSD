"use client"

import { useEffect, useRef } from "react"

interface AudioVisualizerProps {
  isActive?: boolean
  className?: string
}

export function AudioVisualizer({ isActive = false, className = "" }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const bars = 60
    const barWidth = canvas.offsetWidth / bars
    let animationTime = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      for (let i = 0; i < bars; i++) {
        const baseHeight = isActive ? Math.sin(animationTime * 0.02 + i * 0.4) * 40 + 50 : Math.random() * 15 + 5

        const gradient = ctx.createLinearGradient(0, canvas.offsetHeight, 0, 0)
        gradient.addColorStop(0, "rgba(132, 204, 22, 0.8)")
        gradient.addColorStop(0.5, "rgba(132, 204, 22, 0.6)")
        gradient.addColorStop(1, "rgba(132, 204, 22, 0.3)")

        ctx.fillStyle = gradient
        ctx.fillRect(i * barWidth + barWidth * 0.1, canvas.offsetHeight - baseHeight, barWidth * 0.8, baseHeight)
      }

      animationTime += isActive ? 3 : 0.5
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive])

  return <canvas ref={canvasRef} className={`w-full h-full ${className}`} />
}
