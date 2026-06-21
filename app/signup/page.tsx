import { AuthForm } from "@/components/auth-form"
import { PROJECT } from "@/lib/project-facts"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: `Sign Up - ${PROJECT.fullName}`,
  description: `Create your ${PROJECT.name} account to start detecting synthetic speech with AI technology`,
}

export default function SignUpPage() {
  return <AuthForm mode="signup" />
}
