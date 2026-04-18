import { type NextRequest, NextResponse } from "next/server"
import { findBestYouTubeVideo } from "@/lib/youtube-video"

export const runtime = "nodejs"
export const maxDuration = 30

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const topic = searchParams.get("topic")?.trim()
  const subject = searchParams.get("subject")?.trim() || ""
  const chapter = searchParams.get("chapter")?.trim() || ""
  const standard = searchParams.get("standard")?.trim() || ""

  if (!topic) {
    return NextResponse.json({ error: "topic is required" }, { status: 400 })
  }

  if (!process.env.YOUTUBE_API_KEY) {
    return NextResponse.json(
      { error: "YouTube API not configured on this server" },
      { status: 503 },
    )
  }

  try {
    const video = await findBestYouTubeVideo(topic, subject, chapter, standard)

    if (!video) {
      return NextResponse.json(
        { error: "No suitable animated educational video found for this topic" },
        { status: 404 },
      )
    }

    return NextResponse.json(video, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (err) {
    console.error("[YouTube Video API] Error:", err)
    const message = err instanceof Error ? err.message : "Failed to find video"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
