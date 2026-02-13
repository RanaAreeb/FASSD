import { AuthForm } from "@/components/auth-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In - Forensic Acoustics for Synthetic Speech Detection",
  description: "Sign in to your FASSD account to access AI-powered synthetic speech detection",
}

export default function SignInPage() {
  return <AuthForm mode="signin" />
}
