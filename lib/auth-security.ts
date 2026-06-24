import type { User } from "firebase/auth"

export function isPasswordProviderUser(user: User | null): boolean {
  return user?.providerData.some((provider) => provider.providerId === "password") ?? false
}

export function needsEmailVerification(user: User | null): boolean {
  if (!user) return false
  return isPasswordProviderUser(user) && !user.emailVerified
}
