import { type NextRequest, NextResponse } from "next/server"

/**
 * Server-side Supabase sync endpoint.
 * Runs on the server where there is no CORS issue and no browser fetch restriction.
 * This is used as a fallback when the browser-side save fails.
 */
export async function POST(request: NextRequest) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json(
      { ok: false, error: "Supabase not configured on this server" },
      { status: 503 }
    )
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
  }

  const { session } = body
  if (!session?.transcript) {
    return NextResponse.json({ ok: false, error: "session.transcript required" }, { status: 400 })
  }

  const lessonId = crypto.randomUUID()

  const headers = {
    "Content-Type": "application/json",
    "Prefer":       "return=minimal",
    "apikey":       SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/Lessons`, {
      method:  "POST",
      headers,
      body: JSON.stringify({
        id:          lessonId,
        subject:     session.metadata?.subject  || "General",
        standard:    session.metadata?.standard || "General",
        topic:       session.metadata?.topic    || session.title || "Lesson",
        explanation: session.explanation        || session.transcript,
        transcript:  session.transcript,
      }),
    })

    if (!res.ok && res.status !== 201) {
      const text = await res.text().catch(() => String(res.status))
      console.error("[Supabase server-sync] Lesson insert failed:", res.status, text.slice(0, 200))
      return NextResponse.json({ ok: false, error: text }, { status: 502 })
    }

    // Also save image URL as media record if provided
    if (session.imageUrl) {
      await fetch(`${SUPABASE_URL}/rest/v1/Media`, {
        method:  "POST",
        headers,
        body: JSON.stringify({ lesson_id: lessonId, type: "image_url", url: session.imageUrl }),
      }).catch(() => null)
    }

    console.info("[Supabase server-sync] ✓ Saved lesson:", lessonId)
    return NextResponse.json({ ok: true, lessonId })
  } catch (err: any) {
    console.error("[Supabase server-sync] Exception:", err?.message)
    return NextResponse.json({ ok: false, error: err?.message || "Server error" }, { status: 500 })
  }
}
