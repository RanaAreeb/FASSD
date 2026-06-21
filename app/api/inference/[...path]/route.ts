import { NextRequest, NextResponse } from "next/server"

const TARGET = (process.env.INFERENCE_PROXY_TARGET || "http://127.0.0.1:8000").replace(/\/$/, "")
const TIMEOUT_MS = 10 * 60 * 1000
const API_KEY = process.env.INFERENCE_API_KEY?.trim() || ""

const ALLOWED_GET_EXACT = new Set(["", "health", "model-info"])
const ALLOWED_POST = new Set(["analyze", "analyze-audio"])

function isReportDownloadPath(pathSegments: string[]): boolean {
  return (
    pathSegments.length === 3 &&
    pathSegments[0] === "reports" &&
    (pathSegments[2] === "pdf" || pathSegments[2] === "json")
  )
}

function isPathAllowed(method: string, pathSegments: string[]): boolean {
  const path = pathSegments.join("/")
  if (method === "GET") {
    return ALLOWED_GET_EXACT.has(path) || isReportDownloadPath(pathSegments)
  }
  if (method === "POST") return ALLOWED_POST.has(path)
  return false
}

async function proxy(request: NextRequest, pathSegments: string[]) {
  if (!isPathAllowed(request.method, pathSegments)) {
    return NextResponse.json({ detail: "Forbidden inference path." }, { status: 403 })
  }

  const path = pathSegments.join("/")
  const url = `${TARGET}/${path}${request.nextUrl.search}`

  const headers = new Headers()
  const contentType = request.headers.get("content-type")
  if (contentType) headers.set("content-type", contentType)
  const authorization = request.headers.get("authorization")
  if (authorization) headers.set("authorization", authorization)
  if (API_KEY) headers.set("X-API-Key", API_KEY)

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
        "content-disposition": upstream.headers.get("content-disposition") || "",
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

export const maxDuration = 300
