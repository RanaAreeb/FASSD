import { AuthForm } from "@/components/auth-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up - DeepGuard",
  description: "Create your DeepGuard account to start detecting deepfake audio with AI technology",
}

export default function SignUpPage() {
  return <AuthForm mode="signup" />
}
