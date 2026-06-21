"use client"

import { useEffect, useState } from "react"
import { PROJECT } from "@/lib/project-facts"

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsVisible(false), 500)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 150)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  return (
    <div className={`loading-screen transition-opacity duration-500 ${progress >= 100 ? "opacity-0" : "opacity-100"}`}>
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          <div className="loading-logo"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="text-center">
          <div className="loading-text">{PROJECT.name}</div>
          <div className="text-muted-foreground text-sm mt-2">Initializing Detection Engine...</div>
          <div className="w-64 h-1 bg-border rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">{Math.round(progress)}%</div>
        </div>
      </div>
    </div>
  )
}
