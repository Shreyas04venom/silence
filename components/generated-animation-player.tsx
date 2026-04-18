"use client"

import { useEffect, useState } from "react"
import { Loader2, AlertTriangle } from "lucide-react"
import { isDirectVideoUrl } from "@/lib/animation-url"

interface GeneratedAnimationPlayerProps {
  src: string
  title: string
}

interface VideoFailurePayload {
  message: string
  fallbackUrl?: string
}

async function readFailurePayload(response: Response): Promise<VideoFailurePayload> {
  const contentType = response.headers.get("content-type") || ""

  try {
    if (contentType.includes("application/json")) {
      const payload = (await response.json()) as { error?: string; fallbackUrl?: string }
      return {
        message: payload.error || `Request failed with ${response.status}`,
        fallbackUrl: payload.fallbackUrl,
      }
    }

    const text = await response.text()
    return {
      message: text.slice(0, 240) || `Request failed with ${response.status}`,
    }
  } catch {
    return {
      message: `Request failed with ${response.status}`,
    }
  }
}

export function GeneratedAnimationPlayer({ src, title }: GeneratedAnimationPlayerProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null)
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    isDirectVideoUrl(src) ? "loading" : "ready",
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isDirectVideoUrl(src)) {
      setResolvedSrc(null)
      setFallbackSrc(null)
      setStatus("ready")
      setError(null)
      return
    }

    const controller = new AbortController()
    let objectUrl: string | null = null

    async function loadVideo() {
      setStatus("loading")
      setError(null)
      setResolvedSrc(null)
      setFallbackSrc(null)

      try {
        const response = await fetch(src, {
          signal: controller.signal,
          cache: "no-store",
        })

        const contentType = response.headers.get("content-type") || ""
        if (!response.ok || contentType.includes("application/json")) {
          const failure = await readFailurePayload(response)
          if (failure.fallbackUrl) {
            setFallbackSrc(failure.fallbackUrl)
            setStatus("ready")
            return
          }
          throw new Error(failure.message)
        }

        if (!contentType.toLowerCase().includes("video")) {
          throw new Error(`Video service returned ${contentType || "unknown content type"}`)
        }

        const blob = await response.blob()
        if (blob.size === 0) {
          throw new Error("Generated video was empty")
        }

        objectUrl = URL.createObjectURL(blob)
        setResolvedSrc(objectUrl)
        setStatus("ready")
      } catch (loadError) {
        if (controller.signal.aborted) return
        setStatus("error")
        setError(loadError instanceof Error ? loadError.message : "Failed to load generated video")
      }
    }

    loadVideo()

    return () => {
      controller.abort()
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [src])

  if (!isDirectVideoUrl(src)) {
    return <iframe src={src} className="absolute inset-0 w-full h-full border-0" title={title} allowFullScreen />
  }

  if (fallbackSrc) {
    return <iframe src={fallbackSrc} className="absolute inset-0 w-full h-full border-0" title={title} allowFullScreen />
  }

  if (status === "loading") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm font-medium">Generating video...</p>
        <p className="max-w-sm text-center text-xs text-white/70">
          First render can take a while because the AI video is generated on the backend.
        </p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black px-6 text-white">
        <AlertTriangle className="h-8 w-8 text-amber-400" />
        <p className="text-sm font-semibold">Video generation failed</p>
        <p className="max-w-lg text-center text-xs text-white/70">{error || "Unknown video generation error"}</p>
      </div>
    )
  }

  return (
    <video
      src={resolvedSrc || src}
      className="absolute inset-0 w-full h-full"
      title={title}
      controls
      autoPlay
      loop
      muted
      playsInline
    />
  )
}
