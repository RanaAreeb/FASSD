"use client"

import { createContext, useContext } from "react"

/** False while intro loading screen runs; true when page animations may start. */
export const MotionReadyContext = createContext(true)

export function useMotionReady() {
  return useContext(MotionReadyContext)
}
