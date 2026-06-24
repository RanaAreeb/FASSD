import { NextRequest, NextResponse } from "next/server"

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY?.trim() || ""
const MAX_TEXT_LENGTH = 2000

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Sign in required to generate test audio." }, { status: 401 })
  }

  if (!DEEPGRAM_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Deepgram is not configured. Add DEEPGRAM_API_KEY to .env.local (server-only) and restart the dev server.",
      },
      { status: 503 },
    )
  }

  let body: { text?: string; model?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const text = body.text?.trim()
  if (!text) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 })
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: `Text must be under ${MAX_TEXT_LENGTH} characters.` }, { status: 400 })
  }

  const model = body.model?.trim() || "aura-2-thalia-en"
  const url = `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(model)}`

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(60_000),
    })

    if (!upstream.ok) {
      const detail = await upstream.text()
      return NextResponse.json(
        { error: detail.slice(0, 300) || `Deepgram error (${upstream.status})` },
        { status: upstream.status },
      )
    }

    const audio = await upstream.arrayBuffer()
    const contentType = upstream.headers.get("content-type") || "audio/mpeg"
    return new NextResponse(audio, {
      status: 200,
      headers: { "Content-Type": contentType },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Deepgram request failed"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
