import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Orbitron } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "next-themes"
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
  title: {
    default: "DeepFakeDetection: Voice integrity screening",
    template: `%s · ${PROJECT.name}`,
  },
  description:
    "Cloud voice integrity platform for synthetic speech screening. Multi-axis evidence for AI origin, replay, channel processing, and partial fabrication, with a live analysis demo.",
  metadataBase: new URL(`https://www.${PROJECT.domain}`),
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "DeepFakeDetection: Voice integrity screening",
    description:
      "Screen audio for synthetic speech across four forensic evidence axes. Live demo at deepfakedetection.dev.",
    url: `https://www.${PROJECT.domain}`,
    siteName: PROJECT.name,
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${orbitron.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          <AuthProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <AppContent>{children}</AppContent>
              <Analytics />
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
