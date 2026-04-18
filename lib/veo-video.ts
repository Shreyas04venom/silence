import { createHash } from "crypto"
import { mkdir, readFile, stat, writeFile } from "fs/promises"
import path from "path"
import type { AnimationStoryboard } from "@/lib/google-ai-services"

const GEMINI_VIDEO_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
const VIDEO_CACHE_DIR = path.join(process.cwd(), "public", "generated-videos")
const CACHE_VERSION = "video-backend-v3"
const POLL_INTERVAL_MS = 10000
const MAX_POLL_MS = 360000
const VEO_MODEL = process.env.GEMINI_VIDEO_MODEL || "veo-3.1-fast-generate-preview"
const VEO_RESOLUTION = process.env.GEMINI_VIDEO_RESOLUTION || "720p"

interface VideoTopicContext {
  topic: string
  chapter?: string
  standard?: string
  subject?: string
}

interface GenerateVeoVideoParams extends VideoTopicContext {
  explanation: string
  storyboard: AnimationStoryboard
}

interface CacheInfo {
  cacheKey: string
  fileName: string
  absolutePath: string
  publicPath: string
}

export interface GeneratedVideoResult {
  buffer: Buffer
  fileName: string
  publicPath: string
  fromCache: boolean
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function slugify(value: string): string {
  const cleaned = cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
  return cleaned || "topic"
}

function buildContextLabel(input: VideoTopicContext): string {
  return [input.standard ? `Standard ${input.standard}` : "", input.subject || "", input.chapter || ""]
    .map((value) => cleanText(value))
    .filter(Boolean)
    .join(", ")
}

function buildCacheInfo(input: VideoTopicContext): CacheInfo {
  const source = JSON.stringify({
    v: CACHE_VERSION,
    topic: cleanText(input.topic),
    chapter: cleanText(input.chapter || ""),
    standard: cleanText(input.standard || ""),
    subject: cleanText(input.subject || ""),
  })
  const cacheKey = createHash("sha1").update(source).digest("hex").slice(0, 16)
  const fileName = `${slugify(input.topic)}-${cacheKey}.mp4`

  return {
    cacheKey,
    fileName,
    absolutePath: path.join(VIDEO_CACHE_DIR, fileName),
    publicPath: `/generated-videos/${fileName}`,
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    const fileStat = await stat(filePath)
    return fileStat.isFile() && fileStat.size > 0
  } catch {
    return false
  }
}

function buildVeoPrompt(input: GenerateVeoVideoParams): string {
  const context = buildContextLabel(input)
  const steps = input.storyboard.steps
    .map((step, index) => `Scene ${index + 1}: ${step.title}. ${step.detail}.`)
    .join(" ")
  const explanation = cleanText(input.explanation)

  return [
    `Create a premium silent educational animation video about ${input.storyboard.displayTitle}.`,
    context ? `Classroom context: ${context}.` : "",
    `Format: 16:9 widescreen, polished cinematic educational animation, high visual fidelity, strong object clarity, rich lighting, smooth motion, and clean composition.`,
    `The visuals must be literal and topic-accurate, not symbolic or generic.`,
    `Keep one coherent scene and transform it step by step so the concept is easy to understand fast.`,
    `Avoid dashboard layouts, split panels, UI cards, block diagrams, floating text walls, and overlapping labels.`,
    `No voiceover, no dialogue, no subtitles, no watermark, and no repeated on-screen text.`,
    `If text appears, use only a very short end title: ${input.storyboard.displayTitle}.`,
    `Visual sequence for the 8-second video: ${steps}`,
    explanation ? `Concept guidance: ${explanation}` : "",
    `The final frame should leave the learner with a clear visual understanding of ${input.storyboard.displayTitle}.`,
  ]
    .filter(Boolean)
    .join(" ")
}

async function startVideoOperation(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(`${GEMINI_VIDEO_BASE_URL}/models/${VEO_MODEL}:predictLongRunning`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        aspectRatio: "16:9",
        resolution: VEO_RESOLUTION,
        negativePrompt:
          "dashboard layout, split panels, ui cards, block diagram, floating labels, text wall, subtitles, watermark, logo, blurry subject, low quality, duplicate objects, overlapping elements",
      },
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Veo start failed (${response.status}): ${body.slice(0, 240)}`)
  }

  const operation = (await response.json()) as { name?: string }
  if (!operation.name) {
    throw new Error("Veo did not return an operation name")
  }

  return operation.name
}

async function pollVideoOperation(apiKey: string, operationName: string): Promise<string> {
  const deadline = Date.now() + MAX_POLL_MS

  while (Date.now() < deadline) {
    const response = await fetch(`${GEMINI_VIDEO_BASE_URL}/${operationName}`, {
      headers: {
        "x-goog-api-key": apiKey,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Veo poll failed (${response.status}): ${body.slice(0, 240)}`)
    }

    const status = (await response.json()) as {
      done?: boolean
      error?: { message?: string }
      response?: {
        generateVideoResponse?: {
          generatedSamples?: Array<{
            video?: { uri?: string }
          }>
        }
      }
    }

    if (status.done) {
      if (status.error?.message) {
        throw new Error(status.error.message)
      }

      const videoUri = status.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri
      if (!videoUri) {
        throw new Error("Veo completed without a downloadable video URI")
      }

      return videoUri
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
  }

  throw new Error("Veo generation timed out")
}

async function downloadVideo(apiKey: string, videoUri: string): Promise<Buffer> {
  const response = await fetch(videoUri, {
    headers: {
      "x-goog-api-key": apiKey,
    },
    redirect: "follow",
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Video download failed (${response.status}): ${body.slice(0, 240)}`)
  }

  const contentType = response.headers.get("content-type") || ""
  if (!contentType.toLowerCase().includes("video")) {
    const body = await response.text()
    throw new Error(`Video download returned ${contentType || "unknown content type"}: ${body.slice(0, 240)}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  if (buffer.length === 0) {
    throw new Error("Downloaded video was empty")
  }

  return buffer
}

function getApiKeys(): string[] {
  return (process.env.GEMINI_API_KEY || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean)
}

export async function getCachedGeneratedVideo(input: VideoTopicContext): Promise<GeneratedVideoResult | null> {
  const cacheInfo = buildCacheInfo(input)
  if (!(await fileExists(cacheInfo.absolutePath))) {
    return null
  }

  const buffer = await readFile(cacheInfo.absolutePath)
  return {
    buffer,
    fileName: cacheInfo.fileName,
    publicPath: cacheInfo.publicPath,
    fromCache: true,
  }
}

export async function saveGeneratedVideoToCache(
  input: VideoTopicContext,
  buffer: Buffer,
): Promise<{ fileName: string; publicPath: string }> {
  const cacheInfo = buildCacheInfo(input)
  await mkdir(VIDEO_CACHE_DIR, { recursive: true })
  await writeFile(cacheInfo.absolutePath, buffer)
  return {
    fileName: cacheInfo.fileName,
    publicPath: cacheInfo.publicPath,
  }
}

export function buildDynamicVideoApiUrl(input: VideoTopicContext): string {
  const searchParams = new URLSearchParams()
  searchParams.set("topic", input.topic)
  if (input.chapter) searchParams.set("chapter", input.chapter)
  if (input.standard) searchParams.set("standard", input.standard)
  if (input.subject) searchParams.set("subject", input.subject)
  return `/api/generate-video?${searchParams.toString()}`
}

export async function generateEducationalVideo(input: GenerateVeoVideoParams): Promise<GeneratedVideoResult> {
  const cacheInfo = buildCacheInfo(input)
  const cached = await getCachedGeneratedVideo(input)
  if (cached) return cached

  const prompt = buildVeoPrompt(input)
  const keys = getApiKeys()
  let lastError: unknown

  if (keys.length === 0) {
    throw new Error("GEMINI_API_KEY is not configured for Veo video generation")
  }

  for (const apiKey of keys) {
    try {
      const operationName = await startVideoOperation(apiKey, prompt)
      const videoUri = await pollVideoOperation(apiKey, operationName)
      const buffer = await downloadVideo(apiKey, videoUri)
      await saveGeneratedVideoToCache(input, buffer)

      return {
        buffer,
        fileName: cacheInfo.fileName,
        publicPath: cacheInfo.publicPath,
        fromCache: false,
      }
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Failed to generate Veo video")
}
