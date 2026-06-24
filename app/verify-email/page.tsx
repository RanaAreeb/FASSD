"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { needsEmailVerification } from "@/lib/auth-security"
import { MailCheck, RefreshCw, Send } from "lucide-react"

export default function VerifyEmailPage() {
  const router = useRouter()
  const { user, loading, resendEmailVerification, refreshUser, signOut } = useAuth()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<"resend" | "refresh" | null>(null)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/signin")
      return
    }
    if (!needsEmailVerification(user)) {
      router.replace("/dashboard")
    }
  }, [loading, router, user])

  const handleResend = async () => {
    setBusy("resend")
    setError(null)
    setMessage(null)
    try {
      await resendEmailVerification()
      setMessage("Verification email sent. Check your inbox and spam folder.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send verification email.")
    } finally {
      setBusy(null)
    }
  }

  const handleRefresh = async () => {
    setBusy("refresh")
    setError(null)
    setMessage(null)
    try {
      const refreshed = await refreshUser()
      if (refreshed && !needsEmailVerification(refreshed)) {
        router.replace("/dashboard")
        return
      }
      setMessage("Email is not verified yet. Open the verification link, then try again.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not refresh verification status.")
    } finally {
      setBusy(null)
    }
  }

  if (loading || !user || !needsEmailVerification(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md glass-morphism border-glow">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <MailCheck className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            We sent a verification link to {user.email}. Email/password accounts must verify ownership before using
            the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && <p className="text-sm rounded-lg bg-primary/10 text-primary p-3">{message}</p>}
          {error && <p className="text-sm rounded-lg bg-destructive/10 text-destructive p-3">{error}</p>}

          <Button className="w-full" onClick={handleRefresh} disabled={!!busy}>
            <RefreshCw className={`w-4 h-4 mr-2 ${busy === "refresh" ? "animate-spin" : ""}`} />
            I verified my email
          </Button>
          <Button variant="outline" className="w-full" onClick={handleResend} disabled={!!busy}>
            <Send className="w-4 h-4 mr-2" />
            Resend verification email
          </Button>
          <Button variant="ghost" className="w-full" onClick={signOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
