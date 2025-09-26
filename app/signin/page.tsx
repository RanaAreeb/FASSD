import { AuthForm } from "@/components/auth-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In - DeepGuard",
  description: "Sign in to your DeepGuard account to access AI-powered deepfake audio detection",
}

export default function SignInPage() {
  return <AuthForm mode="signin" />
}
