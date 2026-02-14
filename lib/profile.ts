import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { doc, updateDoc } from "firebase/firestore"
import { storage, db } from "./firebase"

export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  if (!storage || !db) return null
  const ext = file.name.split(".").pop() || "jpg"
  const avatarRef = ref(storage, `avatars/${userId}.${ext}`)
  await uploadBytes(avatarRef, file, { contentType: file.type })
  const url = await getDownloadURL(avatarRef)
  await updateDoc(doc(db, "users", userId), { avatarUrl: url })
  return url
}
