import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const TEST_AUDIO_ROOT = path.join(process.cwd(), "public", "test")

const MIME_BY_EXT: Record<string, string> = {
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".ogg": "audio/ogg",
  ".flac": "audio/flac",
  ".webm": "audio/webm",
}

function resolveTestAudioPath(segments: string[]): string | null {
  if (!segments.length || segments.some((part) => part === ".." || part === "." || part.includes("\\"))) {
    return null
  }
  const resolvedRoot = path.resolve(TEST_AUDIO_ROOT)
  const resolvedFile = path.resolve(TEST_AUDIO_ROOT, ...segments)
  if (resolvedFile !== resolvedRoot && !resolvedFile.startsWith(`${resolvedRoot}${path.sep}`)) {
    return null
  }
  return resolvedFile
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params
  const filePath = resolveTestAudioPath(segments)
  if (!filePath) {
    return NextResponse.json({ detail: "Invalid sample path." }, { status: 400 })
  }

  try {
    const data = await fs.readFile(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const filename = path.basename(filePath)
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": MIME_BY_EXT[ext] ?? "application/octet-stream",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch {
    return NextResponse.json(
      { detail: `Sample not found: public/test/${segments.join("/")}` },
      { status: 404 },
    )
  }
}
