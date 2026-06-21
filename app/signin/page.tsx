import { AuthForm } from "@/components/auth-form"
import { PROJECT } from "@/lib/project-facts"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: `Sign In - ${PROJECT.fullName}`,
  description: `Sign in to your ${PROJECT.name} account to access AI-powered synthetic speech detection`,
}

export default function SignInPage() {
  return <AuthForm mode="signin" />
}
