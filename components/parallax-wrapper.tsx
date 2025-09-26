"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface ParallaxWrapperProps {
  children: React.ReactNode
  speed?: number
  className?: string
}

export function ParallaxWrapper({ children, speed = 0.5, className = "" }: ParallaxWrapperProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleScroll = () => {
      const scrolled = window.pageYOffset
      const parallax = scrolled * speed
      element.style.transform = `translateY(${parallax}px)`
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [speed])

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  )
}
