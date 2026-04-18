import { VICSession } from "./session-storage"

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  || ""
const SUPABASE_KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const TIMEOUT_MS    = 8000   // 8 second network timeout
const QUEUE_KEY     = "supabase_sync_queue"
const MAX_RETRIES   = 3

// ─────────────────────────────────────────────────────────────────────────────
// Connectivity check — fast, non-throwing
// ─────────────────────────────────────────────────────────────────────────────

let _lastReachable: boolean | null = null
let _lastCheckAt   = 0
const CHECK_TTL    = 30_000  // Re-check connectivity every 30s

async function isSupabaseReachable(): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return false

  const now = Date.now()
  if (_lastReachable !== null && now - _lastCheckAt < CHECK_TTL) {
    return _lastReachable
  }

  try {
    const ctrl  = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 4000)
    // Ping the health endpoint — doesn't require auth, very fast
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method:  "HEAD",
      headers: { apikey: SUPABASE_KEY },
      signal:  ctrl.signal,
    })
    clearTimeout(timer)
    _lastReachable = res.ok || res.status === 400 // 400 = reached but bad query (still alive)
    _lastCheckAt   = now
    return _lastReachable
  } catch {
    _lastReachable = false
    _lastCheckAt   = now
    return false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Raw REST helper — replaces the Supabase JS client for inserts
// Using raw fetch avoids the JS client's own error wrapping which swallows
// the actual network error and makes debugging impossible.
// ─────────────────────────────────────────────────────────────────────────────

async function supabaseInsert(
  table: string,
  row: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { ok: false, error: "Supabase not configured" }
  }

  const ctrl  = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Prefer":        "return=minimal",
        "apikey":        SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
      body:   JSON.stringify(row),
      signal: ctrl.signal,
    })
    clearTimeout(timer)

    if (res.ok || res.status === 201) return { ok: true }

    const text = await res.text().catch(() => String(res.status))
    return { ok: false, error: text }
  } catch (err: any) {
    clearTimeout(timer)
    return { ok: false, error: err?.message ?? "Network error" }
  }
}

async function supabaseUpload(
  bucket: string,
  path: string,
  content: string,
  contentType: string,
): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null

  const ctrl  = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
      method:  "POST",
      headers: {
        "Content-Type":  contentType,
        "apikey":        SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
      body:   new Blob([content], { type: contentType }),
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return null
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
  } catch {
    clearTimeout(timer)
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Offline queue — persisted in localStorage
// Stores sessions that failed to sync so they can be retried later
// ─────────────────────────────────────────────────────────────────────────────

interface QueuedSession {
  session: VICSession
  attempts: number
  queuedAt: number
}

function enqueue(session: VICSession): void {
  try {
    const raw: QueuedSession[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")
    // Deduplicate by session id
    const filtered = raw.filter((q) => q.session.id !== session.id)
    filtered.push({ session, attempts: 0, queuedAt: Date.now() })
    // Keep last 20 in queue max
    if (filtered.length > 20) filtered.splice(0, filtered.length - 20)
    localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered))
  } catch {
    // localStorage might be full — ignore silently
  }
}

function dequeue(sessionId: string): void {
  try {
    const raw: QueuedSession[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")
    localStorage.setItem(QUEUE_KEY, JSON.stringify(raw.filter((q) => q.session.id !== sessionId)))
  } catch {
    // ignore
  }
}

function getQueue(): QueuedSession[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")
  } catch {
    return []
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core sync — one session → Supabase
// ─────────────────────────────────────────────────────────────────────────────

async function syncSession(session: VICSession): Promise<boolean> {
  const lessonId = crypto.randomUUID()

  // 1. Insert lesson row
  const lessonResult = await supabaseInsert("Lessons", {
    id:          lessonId,
    subject:     session.metadata.subject  || "General",
    standard:    session.metadata.standard || "General",
    topic:       session.metadata.topic    || session.title,
    explanation: session.explanation       || session.transcript,
    transcript:  session.transcript,
  })

  if (!lessonResult.ok) {
    console.warn("[Supabase] Lesson insert failed:", lessonResult.error)
    return false
  }

  // 2. Upload media in parallel — failures don't block the lesson save
  const mediaInserts: Promise<unknown>[] = []

  const addMedia = async (type: string, url: string) => {
    await supabaseInsert("Media", { lesson_id: lessonId, type, url }).catch(() => null)
  }

  if (session.imageUrl) {
    mediaInserts.push(addMedia("image_url", session.imageUrl))
  }

  if (session.animationUrl) {
    mediaInserts.push(addMedia("animation_url", session.animationUrl))
  }

  if (session.detailedIllustrationSVG) {
    mediaInserts.push(
      supabaseUpload(
        "Lessons-Media",
        `${lessonId}_diagram.svg`,
        session.detailedIllustrationSVG,
        "image/svg+xml",
      ).then((url) => { if (url) addMedia("diagram", url) })
    )
  }

  if (session.signLanguageSVG) {
    mediaInserts.push(
      supabaseUpload(
        "Lessons-Media",
        `${lessonId}_sign.svg`,
        session.signLanguageSVG,
        "image/svg+xml",
      ).then((url) => { if (url) addMedia("sign_language", url) })
    )
  }

  // Wait for all media — swallow individual failures
  await Promise.allSettled(mediaInserts)

  return true
}

// ─────────────────────────────────────────────────────────────────────────────
// Server-side sync fallback
// When the browser can't reach Supabase directly (DNS issue, CORS, project paused),
// we route through our own Next.js API which runs server-side.
// ─────────────────────────────────────────────────────────────────────────────

async function syncViaServer(session: VICSession): Promise<boolean> {
  try {
    const ctrl  = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
    const res   = await fetch("/api/sync-session", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ session }),
      signal:  ctrl.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return false
    const data = await res.json().catch(() => ({}))
    return data.ok === true
  } catch {
    return false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API — called from teacher dashboard
// Never throws. Returns true = saved to cloud, false = queued for later.
// ─────────────────────────────────────────────────────────────────────────────

export async function saveSessionToSupabase(session: VICSession): Promise<boolean> {
  // If not configured at all, skip silently
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.info("[Supabase] Not configured — saving to local queue only.")
    return false
  }

  // Quick reachability check before going further
  const reachable = await isSupabaseReachable()
  if (!reachable) {
    console.info("[Supabase] Unreachable — queuing session for later sync.")
    enqueue(session)
    return false
  }

  // Attempt to sync with retry
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const ok = await syncSession(session)
      if (ok) {
        dequeue(session.id)  // Remove from retry queue if it was there
        console.info(`[Supabase] ✓ Session saved to cloud (attempt ${attempt})`)
        // Fire-and-forget: also flush any previously queued sessions
        flushQueue().catch(() => null)
        return true
      }
    } catch (err) {
      console.warn(`[Supabase] Attempt ${attempt} failed:`, err)
    }

    if (attempt < MAX_RETRIES) {
      // Exponential backoff: 1s, 2s, 4s
      await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)))
    }
  }

  // All retries exhausted — try server-side route as last resort
  // (avoids CORS / DNS issues that affect browser-side fetch)
  console.info("[Supabase] Trying server-side sync route as fallback…")
  try {
    const serverOk = await syncViaServer(session)
    if (serverOk) {
      dequeue(session.id)
      console.info("[Supabase] ✓ Session saved via server-side route")
      return true
    }
  } catch {
    // ignore — fall through to local queue
  }

  // All sync paths exhausted — save to offline queue for next time
  console.info("[Supabase] All sync paths failed — saved to offline queue.")
  enqueue(session)
  return false
}

// ─────────────────────────────────────────────────────────────────────────────
// Background queue flush — retries sessions saved offline
// Called automatically after a successful save, and can be called on app start
// ─────────────────────────────────────────────────────────────────────────────

export async function flushQueue(): Promise<void> {
  const queue = getQueue()
  if (queue.length === 0) return

  const reachable = await isSupabaseReachable()
  if (!reachable) return

  console.info(`[Supabase] Flushing ${queue.length} queued sessions…`)

  for (const item of queue) {
    // Skip sessions that have failed too many times or are older than 7 days
    const tooOld = Date.now() - item.queuedAt > 7 * 24 * 3600 * 1000
    if (item.attempts >= 5 || tooOld) {
      dequeue(item.session.id)
      continue
    }

    try {
      const ok = await syncSession(item.session)
      if (ok) {
        dequeue(item.session.id)
        console.info(`[Supabase] ✓ Flushed queued session: ${item.session.id}`)
      } else {
        // Increment attempts in queue
        const raw: QueuedSession[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")
        const idx = raw.findIndex((q) => q.session.id === item.session.id)
        if (idx >= 0) { raw[idx].attempts++; localStorage.setItem(QUEUE_KEY, JSON.stringify(raw)) }
      }
    } catch {
      // ignore — will retry next time
    }

    // Small delay between queue flushes to avoid hammering the API
    await new Promise((r) => setTimeout(r, 500))
  }
}

/**
 * Check how many sessions are waiting in the offline queue.
 */
export function getPendingQueueCount(): number {
  return getQueue().length
}
