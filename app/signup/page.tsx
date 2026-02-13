import { AuthForm } from "@/components/auth-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up - Forensic Acoustics for Synthetic Speech Detection",
  description: "Create your FASSD account to start detecting synthetic speech with AI technology",
}

export default function SignUpPage() {
  return <AuthForm mode="signup" />
}
