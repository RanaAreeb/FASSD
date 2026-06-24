import { auth } from "@/lib/firebase"

export interface DeepgramTtsOptions {
  text: string
  model?: string
}

export async function generateDeepgramSpeech(options: DeepgramTtsOptions): Promise<File> {
  const user = auth?.currentUser
  if (!user) {
    throw new Error("Sign in to generate AI test audio.")
  }

  const response = await fetch("/api/deepgram/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await user.getIdToken()}`,
    },
    body: JSON.stringify({
      text: options.text,
      model: options.model ?? "aura-2-thalia-en",
    }),
  })

  if (!response.ok) {
    let message = "Deepgram speech generation failed."
    try {
      const data = (await response.json()) as { error?: string }
      if (data.error) message = data.error
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  const blob = await response.blob()
  return new File([blob], `deepgram_ai_${Date.now()}.mp3`, {
    type: blob.type || "audio/mpeg",
  })
}
