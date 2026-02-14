"use client"

import { usePathname } from "next/navigation"
import { Navigation } from "./navigation"
import { LoadingScreen } from "./loading-screen"

const AUTH_PATHS = ["/signin", "/signup"]

export function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_PATHS.includes(pathname ?? "")

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <>
      <LoadingScreen />
      <Navigation />
      {children}
    </>
  )
}
