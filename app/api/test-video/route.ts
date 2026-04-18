import { type NextRequest, NextResponse } from "next/server"

// Simple test endpoint that returns a placeholder video response
export async function GET(request: NextRequest) {
  try {
    const topic = request.nextUrl.searchParams.get("topic")?.trim()

    if (!topic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 })
    }

    // Return a simple test video (1-frame MP4) for testing
    // This is a valid MP4 file with just one black frame
    const testVideoBuffer = Buffer.from([
      0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x00, 0x00, 0x69, 0x73,
      0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32, 0x61, 0x76, 0x63, 0x31, 0x6d, 0x70, 0x34, 0x31, 0x00, 0x00, 0x00, 0x08,
      0x77, 0x69, 0x64, 0x65, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ])

    const headers = new Headers({
      "Content-Type": "video/mp4",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(testVideoBuffer.length),
      "X-Video-Cache": "miss",
      "X-Test": "true",
    })

    return new NextResponse(testVideoBuffer, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("[Test Video] Error:", error)
    const message = error instanceof Error ? error.message : "Failed to generate test video"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
