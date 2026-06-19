"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { LoadingScreen } from "./loading-screen"
import { MotionReadyContext } from "./motion-ready-context"

interface ClientWrapperProps {
  children: React.ReactNode
}

const LOAD_MS = 1600

export function ClientWrapper({ children }: ClientWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [motionReady, setMotionReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      requestAnimationFrame(() => setMotionReady(true))
    }, LOAD_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    <MotionReadyContext.Provider value={motionReady}>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100]"
          >
            <LoadingScreen />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: motionReady ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </MotionReadyContext.Provider>
  )
}
