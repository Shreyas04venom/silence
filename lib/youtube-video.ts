import { GoogleGenerativeAI } from "@google/generative-ai"

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || ""
const GEMINI_KEYS = (process.env.GEMINI_API_KEY || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean)

// ─────────────────────────────────────────────────────────────────────────────
// PURE ANIMATION CHANNELS ONLY — these channels produce ONLY animated content
// Every video from these channels is a fully animated educational explainer
// NO talking heads, NO slideshows — just clean animation like Dr. Binocs
// ─────────────────────────────────────────────────────────────────────────────
const PURE_ANIMATION_CHANNELS: { id: string; name: string; tier: number }[] = [
  // Tier 1: Highest quality, fully animated, perfect for deaf students
  { id: "UCqH9bFVSKN25g3tTdqWzovg", name: "Peekaboo Kidz (Dr. Binocs)", tier: 1 },
  { id: "UCsooa4yRKGN_zEE8iknghZA", name: "TED-Ed", tier: 1 },
  { id: "UCsXVk37bltHxD1rDPwtNM8Q", name: "Kurzgesagt", tier: 1 },
  { id: "UCeiYXex_fwgYDonaTcSIk6w", name: "MinuteEarth", tier: 1 },
  { id: "UCUHW94eEFW7hkUMVaZz4eDg", name: "MinutePhysics", tier: 1 },
  { id: "UCrGLgt766kH924Y-KBQQ-Vg", name: "Primer", tier: 1 },

  // Tier 2: Mostly animated, excellent for school topics
  { id: "UCbMj9vqFVVoaKO4fCFnBpkQ", name: "SciShow Kids", tier: 2 },
  { id: "UCZMG5oXiW1LcNKoqPNZNxuQ", name: "It's AumSum Time", tier: 2 },
  { id: "UCddiUEpeqJcYeBxX1IVBKvQ", name: "The Infographics Show", tier: 2 },
  { id: "UCVk4b-svNJoeyIPgsHmTiHw", name: "CrashCourse Kids", tier: 2 },
  { id: "UCiGxYawhCBH7sMXFzam2dvg", name: "SciShow", tier: 2 },
  { id: "UCEWpbFLzoYGPfuWKJ-0m0yg", name: "AsapSCIENCE", tier: 2 },
  { id: "UCZmadGqBKGMPbNVYs0gZmoA", name: "Stated Clearly", tier: 2 },
  { id: "UCNVppPnfqvJXxFJrXQO1dPg", name: "HippoCampus", tier: 2 },

  // Tier 3: Good animated content mixed with some non-animated
  { id: "UCVhfFXNY0z3-6v3XqSFkZog", name: "Khan Academy", tier: 3 },
  { id: "UCBcRF18a7Qf58cCRy5xuWwQ", name: "Professor Leonard", tier: 3 },
]

// Channel IDs of pure animation channels (tier 1 & 2 only)
const ANIMATION_CHANNEL_IDS = new Set(
  PURE_ANIMATION_CHANNELS.filter((c) => c.tier <= 2).map((c) => c.id)
)

export interface YouTubeVideoResult {
  videoId: string
  title: string
  channelTitle: string
  channelId: string
  description: string
  thumbnailUrl: string
  isFromAnimationChannel: boolean
  channelTier: number
}

export interface SmartVideoMatch {
  videoId: string
  title: string
  channelTitle: string
  startSeconds: number
  endSeconds: number
  thumbnailUrl: string
  reason: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Gemini helper
// ─────────────────────────────────────────────────────────────────────────────

async function geminiText(prompt: string): Promise<string | null> {
  for (const key of GEMINI_KEYS) {
    try {
      const genAI = new GoogleGenerativeAI(key)
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
      const result = await model.generateContent(prompt)
      return result.response.text().trim()
    } catch {
      continue
    }
  }
  return null
}

async function geminiJson<T>(prompt: string): Promise<T | null> {
  const text = await geminiText(prompt)
  if (!text) return null
  try {
    const jsonMatch =
      text.match(/```json\n?([\s\S]*?)\n?```/) ||
      text.match(/({[\s\S]*})/) ||
      text.match(/(\[[\s\S]*\])/)
    return JSON.parse(jsonMatch ? jsonMatch[1] : text) as T
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core topic keyword extraction
// ─────────────────────────────────────────────────────────────────────────────

async function getSearchKeyword(topic: string, subject?: string): Promise<string> {
  const prompt = `A teacher spoke these words: "${topic}"${subject ? ` (subject: ${subject})` : ""}

Extract the CLEAN educational concept keyword(s) — 2 to 4 words maximum.
Remove filler words, repetitions, speech errors.
Return ONLY the keyword string. No punctuation, no explanation.

Examples:
- "photosynthesis" → photosynthesis
- "wassup how does mitosis work" → mitosis cell division
- "newton laws of motion bro" → newton laws motion
- "tell me about the digestive system" → digestive system
- "quadratic equations maths" → quadratic equations math`

  const result = await geminiText(prompt)
  if (result && result.length > 2 && result.length < 60) return result

  // Fallback: clean the topic string manually
  return topic
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .join(" ")
}

// ─────────────────────────────────────────────────────────────────────────────
// Single channel search — searches within ONE specific animation channel
// ─────────────────────────────────────────────────────────────────────────────

async function searchInChannel(
  channelId: string,
  keyword: string,
  maxResults = 3,
): Promise<YouTubeVideoResult[]> {
  const channelInfo = PURE_ANIMATION_CHANNELS.find((c) => c.id === channelId)

  const params = new URLSearchParams({
    part: "snippet",
    q: keyword,
    channelId,
    type: "video",
    videoEmbeddable: "true",
    videoSyndicated: "true",
    maxResults: String(maxResults),
    order: "relevance",
    key: YOUTUBE_API_KEY,
  })

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return []

    const data = await response.json()
    return (data.items || [])
      .filter((item: any) => item.id?.videoId && item.snippet)
      .map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title || "",
        channelTitle: item.snippet.channelTitle || "",
        channelId: item.snippet.channelId || channelId,
        description: (item.snippet.description || "").slice(0, 300),
        thumbnailUrl:
          item.snippet.thumbnails?.medium?.url ||
          `https://i.ytimg.com/vi/${item.id.videoId}/mqdefault.jpg`,
        isFromAnimationChannel: true,
        channelTier: channelInfo?.tier ?? 3,
      })) as YouTubeVideoResult[]
  } catch {
    return []
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Multi-channel parallel search — searches across all Tier 1 animation channels
// Returns the first batch of results that has at least one video
// ─────────────────────────────────────────────────────────────────────────────

async function searchAcrossAnimationChannels(
  keyword: string,
): Promise<YouTubeVideoResult[]> {
  // Search Tier 1 channels first (best quality animated), then Tier 2 if needed
  const tier1Channels = PURE_ANIMATION_CHANNELS.filter((c) => c.tier === 1).map((c) => c.id)
  const tier2Channels = PURE_ANIMATION_CHANNELS.filter((c) => c.tier === 2).map((c) => c.id)

  console.log(`[YouTube] Searching ${tier1Channels.length} Tier 1 animation channels for: "${keyword}"`)

  // Search all Tier 1 channels in parallel
  const tier1Results = await Promise.all(
    tier1Channels.map((id) => searchInChannel(id, keyword, 3))
  )
  const tier1Flat = tier1Results.flat()

  if (tier1Flat.length >= 3) {
    console.log(`[YouTube] Found ${tier1Flat.length} results from Tier 1 animation channels`)
    return tier1Flat
  }

  // If Tier 1 didn't yield enough, also search Tier 2 channels
  console.log(`[YouTube] Tier 1 gave ${tier1Flat.length} results, expanding to Tier 2 channels`)
  const tier2Results = await Promise.all(
    tier2Channels.map((id) => searchInChannel(id, keyword, 3))
  )
  const tier2Flat = tier2Results.flat()

  const combined = [...tier1Flat, ...tier2Flat]
  console.log(`[YouTube] Combined animation channel results: ${combined.length}`)
  return combined
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback: general YouTube search (last resort, still filtered for animation)
// ─────────────────────────────────────────────────────────────────────────────

async function searchYouTubeGeneral(keyword: string): Promise<YouTubeVideoResult[]> {
  const query = `${keyword} animation explained`
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    videoCategoryId: "27",
    videoEmbeddable: "true",
    videoSyndicated: "true",
    maxResults: "10",
    order: "relevance",
    relevanceLanguage: "en",
    safeSearch: "strict",
    key: YOUTUBE_API_KEY,
  })

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return []

    const data = await response.json()
    return (data.items || [])
      .filter((item: any) => item.id?.videoId && item.snippet)
      .map((item: any) => {
        const cid = item.snippet.channelId || ""
        const channelInfo = PURE_ANIMATION_CHANNELS.find((c) => c.id === cid)
        return {
          videoId: item.id.videoId,
          title: item.snippet.title || "",
          channelTitle: item.snippet.channelTitle || "",
          channelId: cid,
          description: (item.snippet.description || "").slice(0, 300),
          thumbnailUrl:
            item.snippet.thumbnails?.medium?.url ||
            `https://i.ytimg.com/vi/${item.id.videoId}/mqdefault.jpg`,
          isFromAnimationChannel: ANIMATION_CHANNEL_IDS.has(cid),
          channelTier: channelInfo?.tier ?? 99,
        }
      }) as YouTubeVideoResult[]
  } catch {
    return []
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AI picks best video — strongly prefers tier 1 animation channels
// ─────────────────────────────────────────────────────────────────────────────

async function pickBestVideo(
  results: YouTubeVideoResult[],
  topic: string,
): Promise<YouTubeVideoResult | null> {
  if (results.length === 0) return null

  // Sort: Tier 1 first, then Tier 2, then others
  const sorted = [...results].sort((a, b) => a.channelTier - b.channelTier)

  if (sorted.length === 1) return sorted[0]

  // If all from animation channels, use Gemini to pick the most topic-relevant one
  const prompt = `A teacher is teaching "${topic}" to school students (including deaf students).

These are animated educational YouTube videos found for this topic:
${JSON.stringify(
  sorted.slice(0, 8).map((r, i) => ({
    index: i,
    title: r.title,
    channel: r.channelTitle,
    tier: r.channelTier,
    description: r.description.slice(0, 100),
  })),
  null,
  2,
)}

Pick the SINGLE best video. Rules:
- Lower tier number = better animation quality (prefer tier 1 > tier 2 > tier 3)
- Among same tier, pick the one whose title most closely matches the topic "${topic}"
- The video must be suitable for classroom students
- Return ONLY valid JSON: { "index": <0 to ${Math.min(sorted.length, 8) - 1}> }`

  try {
    const choice = await geminiJson<{ index: number }>(prompt)
    if (choice && typeof choice.index === "number" && sorted[choice.index]) {
      const picked = sorted[choice.index]
      console.log(`[YouTube] AI picked: "${picked.title}" (${picked.channelTitle}, tier ${picked.channelTier})`)
      return picked
    }
  } catch {
    // ignore
  }

  // Fallback: just return highest-tier (best quality) result
  return sorted[0]
}

// ─────────────────────────────────────────────────────────────────────────────
// Smart timestamps — find the core concept window, skip intros
// ─────────────────────────────────────────────────────────────────────────────

async function fetchVideoDetails(videoId: string): Promise<{
  description: string
  durationSeconds: number
}> {
  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    id: videoId,
    key: YOUTUBE_API_KEY,
  })
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { description: "", durationSeconds: 0 }
    const data = await res.json()
    const item = data.items?.[0]
    if (!item) return { description: "", durationSeconds: 0 }

    // Parse ISO 8601 duration (e.g. PT4M30S)
    const dur = item.contentDetails?.duration || ""
    const dMatch = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    const durationSeconds =
      (parseInt(dMatch?.[1] || "0") * 3600) +
      (parseInt(dMatch?.[2] || "0") * 60) +
      parseInt(dMatch?.[3] || "0")

    return {
      description: item.snippet?.description || "",
      durationSeconds,
    }
  } catch {
    return { description: "", durationSeconds: 0 }
  }
}

export async function getSmartTimestamps(
  videoId: string,
  topic: string,
  durationSeconds = 0,
): Promise<{ startSeconds: number; endSeconds: number }> {
  // Words that indicate a chapter is NOT content — skip these
  const SKIP_CHAPTER_KEYWORDS = [
    "intro", "introduction", "opening", "welcome", "hello", "greetings",
    "outro", "end", "ending", "credits", "credit", "thank", "thanks",
    "subscribe", "recap", "summary", "conclusion", "closing", "bye",
    "support", "patron", "sponsor", "patreon", "merchandise", "merch",
    "end card", "end screen",
  ]

  const isSkippableChapter = (title: string) => {
    const t = title.toLowerCase()
    return SKIP_CHAPTER_KEYWORDS.some((kw) => t.includes(kw))
  }

  try {
    const { description, durationSeconds: realDur } = await fetchVideoDetails(videoId)
    const totalDur = realDur || durationSeconds || 300

    // ── Parse YouTube chapters from description ────────────────────────────
    const chapterRegex = /^(?:(\d+):)?(\d+):(\d+)\s+(.+)$/gm
    const chapters: { title: string; startSeconds: number }[] = []
    let match: RegExpExecArray | null
    while ((match = chapterRegex.exec(description)) !== null) {
      const h = match[1] ? parseInt(match[1]) : 0
      const m = parseInt(match[2])
      const s = parseInt(match[3])
      chapters.push({ title: match[4].trim(), startSeconds: h * 3600 + m * 60 + s })
    }

    // ── Credits buffer: animated channels always have end cards (15–30 s) ─
    // We calculate a safe "credits start" to never play past
    const creditsBuffer = Math.min(35, totalDur * 0.12)  // 12% of video or 35s, whichever less
    const safeEnd = totalDur - creditsBuffer

    if (chapters.length >= 2) {
      // Find the first "outro / credits" chapter — everything before it is content
      const outroIdx = chapters.findIndex((c) => isSkippableChapter(c.title))

      // Content chapters = all chapters that are NOT skippable
      const contentChapters = chapters.filter((c) => !isSkippableChapter(c.title))

      if (contentChapters.length === 0) {
        // All chapters skippable? Just play middle 60% of video
        const s = Math.floor(totalDur * 0.15)
        const e = Math.min(Math.floor(totalDur * 0.80), safeEnd)
        return { startSeconds: s, endSeconds: e }
      }

      // Use Gemini to pick the ONE chapter most relevant to the topic
      const prompt = `Teaching topic: "${topic}"

Video chapters (index, time, title):
${chapters.map((c, i) => `${i}. [${c.startSeconds}s] ${c.title}`).join("\n")}

Which chapter index has the CORE concept explanation for "${topic}"?
Rules: Skip any intro/introduction chapter. Skip any outro/credits/thanks/subscribe chapter.
Return ONLY JSON: { "index": <number> }`

      const choice = await geminiJson<{ index: number }>(prompt)

      if (choice && typeof choice.index === "number" && chapters[choice.index]) {
        const startCh = chapters[choice.index]

        // End = whichever comes FIRST:
        //   • start of next content chapter
        //   • start of outro/credits chapter
        //   • startCh.startSeconds + 4 minutes
        //   • safeEnd (never play into credits)
        const nextChapter = chapters[choice.index + 1]
        const outroStart = outroIdx >= 0 ? chapters[outroIdx].startSeconds : Infinity

        let endSeconds = Math.min(
          nextChapter ? nextChapter.startSeconds : Infinity,
          outroStart,
          startCh.startSeconds + 240,
          safeEnd,
        )

        const startSeconds = Math.max(0, startCh.startSeconds - 2)

        // Sanity check — clip must be at least 20 seconds
        if (endSeconds - startSeconds < 20) endSeconds = Math.min(startSeconds + 180, safeEnd)

        console.log(
          `[YouTube] Smart trim: "${startCh.title}" → ${startSeconds}s – ${endSeconds}s` +
          ` (creditsBuffer=${creditsBuffer.toFixed(0)}s, totalDur=${totalDur}s)`
        )
        return { startSeconds, endSeconds }
      }

      // Gemini failed — use first content chapter, end before outro
      const firstContent = contentChapters[0]
      const endOfContent = outroIdx >= 0
        ? chapters[outroIdx].startSeconds
        : safeEnd
      return {
        startSeconds: Math.max(0, firstContent.startSeconds - 2),
        endSeconds: Math.min(endOfContent, firstContent.startSeconds + 240),
      }
    }

    // ── No chapters found ──────────────────────────────────────────────────
    // For short animated videos (≤7 min) skip first 10s intro, play to safeEnd
    if (totalDur > 0 && totalDur <= 420) {
      return { startSeconds: 10, endSeconds: Math.max(safeEnd, 30) }
    }

    // Long video — skip first 15s, play at most 3.5 min, stop before credits
    return { startSeconds: 15, endSeconds: Math.min(safeEnd, 15 + 210) }

  } catch (err) {
    console.warn("[YouTube] getSmartTimestamps error:", err)
    return { startSeconds: 10, endSeconds: 190 }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN — full animated video search pipeline
// ─────────────────────────────────────────────────────────────────────────────

export async function findBestYouTubeVideo(
  topic: string,
  subject?: string,
  chapter?: string,
  standard?: string,
): Promise<SmartVideoMatch | null> {
  if (!YOUTUBE_API_KEY) {
    console.warn("[YouTube] No YOUTUBE_API_KEY")
    return null
  }

  console.log(`[YouTube] Finding ANIMATED video for: "${topic}"`)

  // Step 1: Extract clean keyword from teacher's speech
  const keyword = await getSearchKeyword(topic, subject)
  console.log(`[YouTube] Keyword: "${keyword}"`)

  // Step 2: Search DIRECTLY inside pure animation channels (parallel)
  let results = await searchAcrossAnimationChannels(keyword)

  // Step 3: If animation channels didn't return enough, fall back to general search
  // but still filter/prefer animation channels in the ranking
  if (results.length === 0) {
    console.log("[YouTube] No results from animation channels, trying general search")
    results = await searchYouTubeGeneral(keyword)
  }

  if (results.length === 0) {
    console.warn("[YouTube] No results found at all")
    return null
  }

  console.log(`[YouTube] Total candidates: ${results.length}`)

  // Step 4: AI picks the very best animated video
  const best = await pickBestVideo(results, topic)
  if (!best) return null

  console.log(`[YouTube] Selected: "${best.title}" by ${best.channelTitle} (${best.videoId})`)

  // Step 5: Smart timestamps
  const { startSeconds, endSeconds } = await getSmartTimestamps(best.videoId, topic)

  return {
    videoId: best.videoId,
    title: best.title,
    channelTitle: best.channelTitle,
    startSeconds,
    endSeconds,
    thumbnailUrl: best.thumbnailUrl,
    reason: `Animated educational video from ${best.channelTitle}`,
  }
}
