import { NextRequest, NextResponse } from "next/server"

const TARGET = (process.env.INFERENCE_PROXY_TARGET || "http://127.0.0.1:8000").replace(/\/$/, "")
const TIMEOUT_MS = 10 * 60 * 1000

async function proxy(request: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join("/")
  const url = `${TARGET}/${path}${request.nextUrl.search}`

  const headers = new Headers()
  const contentType = request.headers.get("content-type")
  if (contentType) headers.set("content-type", contentType)

  const init: RequestInit = {
    method: request.method,
    headers,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer()
  }

  try {
    const upstream = await fetch(url, init)
    const body = await upstream.arrayBuffer()
    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Inference proxy failed"
    return NextResponse.json(
      {
        processing_status: "error",
        error_message: `Inference proxy could not reach ${TARGET}: ${message}`,
      },
      { status: 502 },
    )
  }
}

type RouteContext = { params: Promise<{ path: string[] }> }

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxy(request, path)
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxy(request, path)
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxy(request, path)
}

export const maxDuration = 300
