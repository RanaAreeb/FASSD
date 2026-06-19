import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  limit,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"

export interface AudioAnalysis {
  id?: string
  userId: string
  filename: string
  fileSize: string
  duration: string
  isDeepfake: boolean
  confidence: number
  attackType?: string
  processingTime: number
  details: {
    spectralAnalysis: number
    temporalConsistency: number
    neuralNetworkScore: number
    artifactDetection: number
  }
  createdAt: string
}

const ATTACK_TYPES = [
  "Voice Cloning",
  "Speech Synthesis",
  "Audio Manipulation",
  "Replay Attack",
  "Unknown",
] as const

export function getAttackTypeForDeepfake(isDeepfake: boolean): string {
  if (!isDeepfake) return "Human likely"
  return ATTACK_TYPES[Math.floor(Math.random() * (ATTACK_TYPES.length - 1))]
}

export async function saveAudioAnalysis(
  userId: string,
  analysis: Omit<AudioAnalysis, "id" | "userId" | "createdAt">
): Promise<string | null> {
  if (!db) return null
  const docRef = await addDoc(collection(db, "audioAnalyses"), {
    ...analysis,
    userId,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export async function getAudioHistory(userId: string): Promise<AudioAnalysis[]> {
  if (!db) return []
  const q = query(collection(db, "audioAnalyses"), where("userId", "==", userId), limit(50))
  const snapshot = await getDocs(q)
  const results = snapshot.docs.map((docSnap) => {
    const data = docSnap.data()
    const ts = data.createdAt
    const createdAt =
      ts && typeof (ts as { toMillis?: () => number }).toMillis === "function"
        ? new Date((ts as { toMillis: () => number }).toMillis()).toISOString()
        : typeof ts === "number"
          ? new Date(ts).toISOString()
          : (ts as string) || ""
    return { id: docSnap.id, ...data, createdAt } as AudioAnalysis
  })
  results.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
  return results
}

export async function getForensicReport(
  analysisId: string
): Promise<AudioAnalysis | null> {
  if (!db) return null
  const docRef = doc(db, "audioAnalyses", analysisId)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  const data = snapshot.data()
  const ts = data?.createdAt
  const createdAt =
    ts && typeof (ts as { toMillis?: () => number }).toMillis === "function"
      ? new Date((ts as { toMillis: () => number }).toMillis()).toISOString()
      : typeof ts === "number"
        ? new Date(ts).toISOString()
        : (ts as string) || ""
  return { id: snapshot.id, ...data, createdAt } as AudioAnalysis
}
