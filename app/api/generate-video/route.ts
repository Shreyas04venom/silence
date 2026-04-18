import { type NextRequest, NextResponse } from "next/server"
import { Buffer } from "node:buffer"
import { generateAnimationStoryboard, generateEducationalContent } from "@/lib/google-ai-services"
import { generateVideoFromLocalBackend, hasLocalVideoBackend } from "@/lib/local-video-backend"
import { resolveTopicAssets } from "@/lib/topic-assets"
import { generateEducationalVideo, getCachedGeneratedVideo, saveGeneratedVideoToCache } from "@/lib/veo-video"

export const runtime = "nodejs"
export const maxDuration = 300

function toFileName(topic: string): string {
  return `${topic.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "lesson"}.mp4`
}

function buildVideoResponse(
  request: NextRequest,
  buffer: Buffer,
  fileName: string,
  cacheStatus: "hit" | "miss",
  contentType = "video/mp4",
) {
  const total = buffer.length
  const range = request.headers.get("range")
  const headers = new Headers({
    "Content-Type": contentType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Disposition": `inline; filename="${fileName}"`,
    "X-Video-Cache": cacheStatus,
  })

  if (!range) {
    headers.set("Content-Length", String(total))
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers,
    })
  }

  const match = range.match(/^bytes=(\d*)-(\d*)$/i)
  if (!match) {
    headers.set("Content-Range", `bytes */${total}`)
    return new NextResponse(null, { status: 416, headers })
  }

  // FIX: Properly handle empty range ends (e.g. bytes=0-)
  const start = match[1] ? Number(parseInt(match[1], 10)) : 0
  const end = (match[2] && match[2] !== "") ? Number(parseInt(match[2], 10)) : total - 1

  if (isNaN(start) || isNaN(end) || start < 0 || end < start || start >= total) {
    headers.set("Content-Range", `bytes */${total}`)
    return new NextResponse(null, { status: 416, headers })
  }

  const chunkEnd = Math.min(end, total - 1)
  const chunk = buffer.subarray(start, chunkEnd + 1)
  
  headers.set("Content-Length", String(chunk.length))
  headers.set("Content-Range", `bytes ${start}-${chunkEnd}/${total}`)

  return new NextResponse(new Uint8Array(chunk), {
    status: 206,
    headers,
  })
}

function createFallbackResponse(message: string, fallbackUrl: string) {
  return NextResponse.json(
    {
      error: message,
      fallbackUrl,
    },
    { status: 503 },
  )
}

export async function GET(request: NextRequest) {
  try {
    const topic = request.nextUrl.searchParams.get("topic")?.trim()
    const chapter = request.nextUrl.searchParams.get("chapter")?.trim() || ""
    const standard = request.nextUrl.searchParams.get("standard")?.trim() || ""
    const subject = request.nextUrl.searchParams.get("subject")?.trim() || ""

    if (!topic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 })
    }

    const cached = await getCachedGeneratedVideo({ topic, chapter, standard, subject })
    if (cached) {
      return buildVideoResponse(request, cached.buffer, cached.fileName, "hit")
    }

    const topicAssets = resolveTopicAssets({ topic, chapter, standard, subject })
    const content = await generateEducationalContent(topic, chapter, standard, subject)
    const storyboard = await generateAnimationStoryboard(
      topic,
      chapter,
      standard,
      subject,
      content.explanation,
      content.visualTranscript,
    )

    // Attempt Local GPU Backend first
    if (hasLocalVideoBackend()) {
      try {
        const localVideo = await generateVideoFromLocalBackend({
          topic,
          chapter,
          standard,
          subject,
          explanation: content.explanation,
          storyboard,
        })

        if (localVideo) {
          const saved = await saveGeneratedVideoToCache({ topic, chapter, standard, subject }, localVideo.buffer)
          return buildVideoResponse(
            request,
            localVideo.buffer,
            saved.fileName || localVideo.fileName || toFileName(topic),
            "miss",
            localVideo.contentType,
          )
        }
      } catch (localError) {
        console.warn("[Video Generation] Local backend failed, falling back to cloud:", localError)
        // If local fails, we don't return here—we let it fall through to Cloud Veo
      }
    }

    // Fallback/Main Cloud Backend (Google Veo)
    try {
      const video = await generateEducationalVideo({
        topic,
        chapter,
        standard,
        subject,
        explanation: content.explanation,
        storyboard,
      })

      return buildVideoResponse(
        request,
        video.buffer,
        video.fileName || toFileName(topic),
        video.fromCache ? "hit" : "miss",
      )
    } catch (videoError) {
      console.warn("[Video Generation] Cloud video generation failed:", videoError)
      if (topicAssets.animationUrl) {
        const message = videoError instanceof Error ? videoError.message : "Video generation failed"
        return createFallbackResponse(message, topicAssets.animationUrl)
      }
      throw videoError
    }
  } catch (error) {
    console.error("[Video Generation] Error:", error)
    const message = error instanceof Error ? error.message : "Failed to generate video"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
