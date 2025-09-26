import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Orbitron } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Navigation } from "@/components/navigation"
import { LoadingScreen } from "@/components/loading-screen"
import { Suspense } from "react"
import "./globals.css"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "DeepGuard - AI Deepfake Audio Detection",
  description: "Revolutionary AI-powered technology that identifies synthetic audio with unprecedented accuracy",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${orbitron.variable} antialiased`}>
        <LoadingScreen />
        <Suspense fallback={<div>Loading...</div>}>
          <Navigation />
          {children}
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
