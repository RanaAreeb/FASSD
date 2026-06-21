import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Orbitron } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { AppContent } from "@/components/app-content"
import { Suspense } from "react"
import { PROJECT } from "@/lib/project-facts"
import "./globals.css"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: PROJECT.fullName,
  description:
    "Upload audio for multi-axis deepfake screening — origin, replay, channel, and partial-segment evidence with experimental indicators only.",
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
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <AppContent>{children}</AppContent>
            <Analytics />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  )
}
