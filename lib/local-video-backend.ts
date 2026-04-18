import type { AnimationStoryboard } from "@/lib/google-ai-services"

interface LocalVideoBackendPayload {
  topic: string
  chapter?: string
  standard?: string
  subject?: string
  explanation: string
  storyboard: AnimationStoryboard
}

export interface LocalVideoResult {
  buffer: Buffer
  contentType: string
  fileName?: string
}

function getBackendUrl(): string | null {
  const value = process.env.LOCAL_VIDEO_API_URL?.trim()
  return value || null
}

function isJsonContentType(contentType: string): boolean {
  return contentType.toLowerCase().includes("application/json")
}

function toAbsoluteUrl(baseUrl: string, candidate: string): string {
  try {
    return new URL(candidate).toString()
  } catch {
    return new URL(candidate, baseUrl).toString()
  }
}

async function extractJsonVideo(baseUrl: string, response: Response): Promise<LocalVideoResult> {
  const payload = (await response.json()) as {
    videoUrl?: string
    video_url?: string
    videoBase64?: string
    video_base64?: string
    mimeType?: string
    mime_type?: string
    fileName?: string
    file_name?: string
    error?: string
  }

  if (payload.error) {
    throw new Error(payload.error)
  }

  const videoUrl = payload.videoUrl || payload.video_url
  if (videoUrl) {
    const downloadResponse = await fetch(toAbsoluteUrl(baseUrl, videoUrl), {
      cache: "no-store",
    })

    if (!downloadResponse.ok) {
      const body = await downloadResponse.text()
      throw new Error(`Local backend video fetch failed (${downloadResponse.status}): ${body.slice(0, 240)}`)
    }

    const contentType = downloadResponse.headers.get("content-type") || "video/mp4"
    const buffer = Buffer.from(await downloadResponse.arrayBuffer())
    return {
      buffer,
      contentType,
      fileName: payload.fileName || payload.file_name,
    }
  }

  const base64 = payload.videoBase64 || payload.video_base64
  if (base64) {
    return {
      buffer: Buffer.from(base64, "base64"),
      contentType: payload.mimeType || payload.mime_type || "video/mp4",
      fileName: payload.fileName || payload.file_name,
    }
  }

  throw new Error("Local video backend returned JSON without video data")
}

export async function generateVideoFromLocalBackend(
  input: LocalVideoBackendPayload,
): Promise<LocalVideoResult | null> {
  const backendUrl = getBackendUrl()
  if (!backendUrl) {
    return null
  }

  let response: Response
  try {
    // Use a 10-second timeout for local backend - fail fast if it's not responding
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify(input),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown network error"
    if (message.includes("aborted")) {
      console.warn("Local video backend request timed out after 10 seconds")
      return null // Timeout - fail gracefully
    }
    throw new Error(`Local video backend is unreachable at ${backendUrl}: ${message}`)
  }

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || ""
    const body = isJsonContentType(contentType)
      ? JSON.stringify(await response.json())
      : await response.text()
    throw new Error(`Local video backend failed (${response.status}): ${body.slice(0, 240)}`)
  }

  const contentType = response.headers.get("content-type") || ""
  if (contentType.toLowerCase().includes("video")) {
    return {
      buffer: Buffer.from(await response.arrayBuffer()),
      contentType,
    }
  }

  if (isJsonContentType(contentType)) {
    return extractJsonVideo(backendUrl, response)
  }

  throw new Error(`Unsupported local video backend response type: ${contentType || "unknown"}`)
}

export function hasLocalVideoBackend(): boolean {
  return Boolean(getBackendUrl())
}
