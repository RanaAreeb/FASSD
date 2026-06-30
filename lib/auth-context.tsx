"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  reload,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc, type UpdateData } from "firebase/firestore"
import { auth, db } from "./firebase"

const isFirebaseReady = typeof auth !== "undefined" && !!auth && typeof db !== "undefined" && !!db

interface UserProfile {
  uid: string
  name: string
  email: string
  avatarUrl?: string
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<User>
  signUp: (email: string, password: string, name: string) => Promise<User>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>
  resendEmailVerification: () => Promise<void>
  refreshUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseReady) {
      setLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth!, async (firebaseUser) => {
      try {
        setUser(firebaseUser)
        if (firebaseUser) {
          try {
            const profileDoc = await getDoc(doc(db!, "users", firebaseUser.uid))
            if (profileDoc.exists()) {
              setUserProfile(profileDoc.data() as UserProfile)
            } else {
              setUserProfile({
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || "",
                email: firebaseUser.email || "",
              })
            }
          } catch {
            setUserProfile({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || "",
              email: firebaseUser.email || "",
            })
          }
        } else {
          setUserProfile(null)
        }
      } finally {
        setLoading(false)
      }
    })
    const fallback = setTimeout(() => setLoading(false), 5000)
    return () => {
      unsubscribe()
      clearTimeout(fallback)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!isFirebaseReady) throw new Error("Firebase not configured")
    const credential = await signInWithEmailAndPassword(auth!, email, password)
    return credential.user
  }

  const signUp = async (email: string, password: string, name: string) => {
    if (!isFirebaseReady) throw new Error("Firebase not configured")
    const { user: newUser } = await createUserWithEmailAndPassword(
      auth!,
      email,
      password
    )
    await sendEmailVerification(newUser)
    const profile: UserProfile = {
      uid: newUser.uid,
      name,
      email,
      createdAt: new Date().toISOString(),
    }
    await setDoc(doc(db!, "users", newUser.uid), profile)
    setUserProfile(profile)
    return newUser
  }

  const signInWithGoogle = async () => {
    if (!isFirebaseReady) throw new Error("Firebase not configured")
    const provider = new GoogleAuthProvider()
    const { user: googleUser } = await signInWithPopup(auth!, provider)
    const profileDoc = await getDoc(doc(db!, "users", googleUser.uid))
    if (!profileDoc.exists()) {
      const profile: UserProfile = {
        uid: googleUser.uid,
        name: googleUser.displayName || "",
        email: googleUser.email || "",
        avatarUrl: googleUser.photoURL || undefined,
        createdAt: new Date().toISOString(),
      }
      await setDoc(doc(db!, "users", googleUser.uid), profile)
    }
  }

  const signOut = async () => {
    if (!isFirebaseReady) return
    await firebaseSignOut(auth!)
    setUserProfile(null)
  }

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!isFirebaseReady || !user) return
    await updateDoc(doc(db!, "users", user.uid), updates as UpdateData<UserProfile>)
    setUserProfile((prev) => (prev ? { ...prev, ...updates } : null))
  }

  const resendEmailVerification = async () => {
    if (!isFirebaseReady || !auth?.currentUser) return
    await sendEmailVerification(auth.currentUser)
  }

  const refreshUser = async () => {
    if (!isFirebaseReady || !auth?.currentUser) return null
    await reload(auth.currentUser)
    setUser(auth.currentUser)
    return auth.currentUser
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updateUserProfile,
        resendEmailVerification,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
