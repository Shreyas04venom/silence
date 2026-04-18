"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Play, Pause, Maximize, RotateCcw, Volume2, VolumeX } from "lucide-react"

interface YouTubeNativePlayerProps {
  videoId: string
  title: string
  startSeconds: number
  endSeconds: number
  channelTitle?: string
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Load YouTube IFrame API once globally
// ─────────────────────────────────────────────────────────────────────────────

function loadYTApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.YT?.Player) return Promise.resolve()

  return new Promise((resolve) => {
    if (document.getElementById("yt-iframe-api")) {
      const check = setInterval(() => {
        if (window.YT?.Player) { clearInterval(check); resolve() }
      }, 80)
      return
    }
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve() }
    const s = document.createElement("script")
    s.id = "yt-iframe-api"
    s.src = "https://www.youtube.com/iframe_api"
    document.head.appendChild(s)
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Apply iframe scale-clip trick to remove YouTube's corner chrome/logo
//
// How it works:
//   The container has overflow:hidden.
//   We scale the iframe very slightly (1%) to hide native iframe borders.
//   We no longer use 18% cropping to preserve blackboard content.
// ─────────────────────────────────────────────────────────────────────────────
function applyIframeCrop(playerId: string) {
  const wrapper = document.getElementById(playerId)
  if (!wrapper) return
  const iframe = wrapper.tagName === "IFRAME"
    ? (wrapper as HTMLIFrameElement)
    : wrapper.querySelector("iframe")
  if (!iframe) return

  // Mild 1% scale just to hide pure borders, removing the old 18% aggressive clip
  const OVER = 0.01 
  iframe.style.position = "absolute"
  iframe.style.width = `${100 + OVER * 200}%`
  iframe.style.height = `${100 + OVER * 200}%`
  iframe.style.top = `-${OVER * 100}%`
  iframe.style.left = `-${OVER * 100}%`
  iframe.style.border = "none"
  iframe.style.pointerEvents = "none"
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function YouTubeNativePlayer({
  videoId,
  title,
  startSeconds,
  endSeconds,
  channelTitle,
}: YouTubeNativePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef   = useRef<any>(null)
  const tickRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const mouseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isReady,   setIsReady]   = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted,   setIsMuted]   = useState(true)   // muted so autoplay works
  const [progress,  setProgress]  = useState(0)       // 0 → 1
  const [isEnded,   setIsEnded]   = useState(false)
  const [curTime,   setCurTime]   = useState(startSeconds)
  const [isMouseActive, setIsMouseActive] = useState(false)

  const playerId = `yt-p-${videoId}-${Math.floor(startSeconds)}`
  const clipLen  = Math.max(1, endSeconds - startSeconds)

  // ── helpers ────────────────────────────────────────────────────────────────

  const fmt = (s: number) => {
    const t = Math.max(0, Math.floor(s))
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`
  }

  const stopTick = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
  }, [])

  const startTick = useCallback(() => {
    stopTick()
    tickRef.current = setInterval(() => {
      const p = playerRef.current
      if (!p?.getCurrentTime) return
      try {
        const ct: number = p.getCurrentTime()
        setCurTime(ct)
        const pct = Math.min(1, Math.max(0, (ct - startSeconds) / clipLen))
        setProgress(pct)
        if (ct >= endSeconds - 0.4) {
          p.pauseVideo()
          setIsPlaying(false)
          setIsEnded(true)
          setProgress(1)
          stopTick()
        }
      } catch { stopTick() }
    }, 400)
  }, [startSeconds, endSeconds, clipLen, stopTick])

  // ── mount / unmount player ─────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    let dead = false

    loadYTApi().then(() => {
      if (dead) return

      playerRef.current = new window.YT.Player(playerId, {
        videoId,
        // Use youtube-nocookie.com host for maximum privacy / less branding
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay:       1,
          mute:           1,
          controls:       0,  // hide YouTube's own control bar
          disablekb:      1,
          modestbranding: 1,  // removes YouTube wordmark from progress bar
          rel:            0,  // no related videos
          iv_load_policy: 3,  // no annotations
          showinfo:       0,
          fs:             0,
          playsinline:    1,
          start:          Math.floor(startSeconds),
          end:            Math.ceil(endSeconds),
          origin:         typeof window !== "undefined" ? window.location.origin : "",
          enablejsapi:    1,
          cc_load_policy: 0,
          hl:             "en",
          vq:             "hd1080", // Request higher quality resolution
        },
        events: {
          onReady(event: any) {
            if (dead) return
            // Apply crop trick once iframe is in DOM
            setTimeout(() => applyIframeCrop(playerId), 0)
            setIsReady(true)
            
            // Force maximum available resolution (1080p target)
            if (event.target.setPlaybackQuality) {
              event.target.setPlaybackQuality('hd1080')
            }
            
            event.target.seekTo(startSeconds, true)
            event.target.playVideo()
            setIsPlaying(true)
            startTick()
          },
          onStateChange(event: any) {
            if (dead) return
            const st: number = event.data
            // Re-apply crop after every state change (YT rebuilds iframe on some)
            setTimeout(() => applyIframeCrop(playerId), 0)
            if (st === 1) {         // playing
              setIsPlaying(true); setIsEnded(false); startTick()
            } else if (st === 2) {  // paused
              setIsPlaying(false); stopTick()
            } else if (st === 0) {  // ended (YouTube's own end)
              setIsPlaying(false); setIsEnded(true); stopTick()
            } else if (st === 5) {  // cued
              event.target.seekTo(startSeconds, true)
              event.target.playVideo()
            }
          },
          onError(e: any) {
            if (dead) return
            console.warn("[YTPlayer] error code", e.data)
            setIsReady(true)
          },
        },
      })
    })

    return () => {
      dead = true
      stopTick()
      try { playerRef.current?.destroy() } catch { /* ignore */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, startSeconds, endSeconds])

  // ── actions ────────────────────────────────────────────────────────────────

  const togglePlay = () => {
    const p = playerRef.current
    if (!p) return
    if (isEnded) {
      p.seekTo(startSeconds, true); p.playVideo()
      setIsEnded(false); setProgress(0); setCurTime(startSeconds)
      return
    }
    isPlaying ? p.pauseVideo() : p.playVideo()
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    const p = playerRef.current
    if (!p) return
    if (isMuted) { p.unMute(); setIsMuted(false) }
    else          { p.mute();   setIsMuted(true)  }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const p = playerRef.current
    if (!p) return
    const { left, width } = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - left) / width))
    const seekTo = startSeconds + ratio * clipLen
    p.seekTo(seekTo, true); p.playVideo()
    setProgress(ratio); setCurTime(seekTo); setIsEnded(false)
  }

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Fullscreen the outer container (which includes our controls + cropped video)
    const el = containerRef.current as HTMLElement & {
      webkitRequestFullscreen?(): void
    }
    if (!el) return
    if (el.requestFullscreen) el.requestFullscreen()
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
  }

  const handleMouseMove = () => {
    setIsMouseActive(true)
    if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current)
    mouseTimeoutRef.current = setTimeout(() => {
      setIsMouseActive(false)
    }, 2500)
  }

  const handleMouseLeave = () => {
    setIsMouseActive(false)
    if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current)
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black rounded-xl select-none group/player ${
        isPlaying && !isMouseActive ? "cursor-none" : ""
      }`}
      style={{ aspectRatio: "16/9", overflow: "hidden" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/*
        ┌─────────────────────────────────────────────────────┐
        │  LAYER 1 (z:0): YouTube iframe — scaled+clipped     │
        │  The iframe is 136% wide & 136% tall, centred.      │
        │  overflow:hidden on the parent crops the corners    │
        │  where YouTube's logo / info icons live.            │
        │  applyIframeCrop() sets this up after mount.        │
        └─────────────────────────────────────────────────────┘
      */}
      <div
        id={playerId}
        style={{
          position: "absolute",
          inset: 0,
          // The crop styling is applied by applyIframeCrop() once the
          // YT API replaces this div with an <iframe>.  We set a safe
          // default here so the div itself stays within bounds.
          overflow: "hidden",
          zIndex: 0,
        }}
      />

      {/*
        ┌─────────────────────────────────────────────────────┐
        │  LAYER 1.5 (z:1): Owner Watermark / Logo Blockers   │
        │  Targeted overlays to hide channel name and owner   │
        │  logos without cropping the actual video frame.     │
        └─────────────────────────────────────────────────────┘
      */}
      <div 
        className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/90 to-transparent pointer-events-none" 
        style={{ zIndex: 1 }} 
      />
      <div 
        className="absolute bottom-2 right-2 w-28 h-12 bg-black/95 blur-[3px] rounded-lg pointer-events-none" 
        style={{ zIndex: 1 }} 
      />

      {/*
        ┌─────────────────────────────────────────────────────┐
        │  LAYER 2 (z:2): transparent click-sink              │
        │  Catches all pointer events so users never          │
        │  accidentally interact with the YouTube iframe.     │
        └─────────────────────────────────────────────────────┘
      */}
      <div
        className="absolute inset-0 cursor-pointer"
        style={{ zIndex: 2 }}
        onClick={togglePlay}
      />

      {/*
        ┌─────────────────────────────────────────────────────┐
        │  LAYER 3 (z:6): loading skeleton                    │
        └─────────────────────────────────────────────────────┘
      */}
      {!isReady && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-zinc-950"
          style={{ zIndex: 6 }}
        >
          <img
            src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
          />
          <div className="relative flex flex-col items-center gap-3">
            <div className="w-14 h-14 border-4 border-white/20 border-t-emerald-400 rounded-full animate-spin" />
            <p className="text-white/80 text-sm font-semibold tracking-wide">Loading animated video…</p>
            <p className="text-white/40 text-xs">{channelTitle}</p>
          </div>
        </div>
      )}

      {/*
        ┌─────────────────────────────────────────────────────┐
        │  LAYER 4 (z:8): pause / replay centre button        │
        │  Shown whenever the clip is not actively playing.   │
        │  The dim bg-black/50 also hides any YouTube UI      │
        │  that might be displayed when paused.               │
        └─────────────────────────────────────────────────────┘
      */}
      {isReady && !isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          style={{ zIndex: 8 }}
          onClick={togglePlay}
        >
          {/* Full-area cover so YouTube's pause overlay is totally hidden */}
          <div className="absolute inset-0 bg-black/55" />

          <div className="relative flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 hover:scale-105 transition-all duration-200 shadow-2xl">
              {isEnded
                ? <RotateCcw className="w-9 h-9 text-white" />
                : <Play className="w-9 h-9 text-white ml-1" />}
            </div>
            <p className="text-white/75 text-sm font-medium">
              {isEnded ? "Replay concept" : "Tap to play"}
            </p>
          </div>
        </div>
      )}

      {/*
        ┌─────────────────────────────────────────────────────┐
        │  LAYER 5 (z:10): custom controls bar               │
        │  Auto-hides when playing unless mouse is active.   │
        │  Held visible when paused or ended.                 │
        └─────────────────────────────────────────────────────┘
      */}
      <div
        className={`absolute bottom-0 left-0 right-0 flex flex-col transition-opacity duration-300 ${
          isPlaying && !isMouseActive ? "opacity-0" : "opacity-100"
        }`}
        style={{
          zIndex: 10,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.65) 50%, transparent 100%)",
          paddingTop: 40,
        }}
      >
        {/* ── progress / scrub bar ── */}
        <div
          className="mx-4 mb-2.5 relative h-[5px] bg-white/20 rounded-full cursor-pointer group/bar hover:h-2 transition-all duration-100"
          onClick={handleSeek}
        >
          {/* played fill */}
          <div
            className="absolute left-0 top-0 bottom-0 rounded-full bg-emerald-400 transition-[width] duration-300"
            style={{ width: `${progress * 100}%` }}
          />
          {/* scrub thumb — appears on hover */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity duration-100 pointer-events-none"
            style={{ left: `calc(${progress * 100}% - 7px)` }}
          />
        </div>

        {/* ── buttons row ── */}
        <div className="flex items-center gap-2 px-4 pb-3.5">
          {/* play/pause/replay */}
          <button
            className="text-white hover:text-emerald-300 transition-colors p-1"
            onClick={(e) => { e.stopPropagation(); togglePlay() }}
          >
            {isEnded
              ? <RotateCcw className="w-5 h-5" />
              : isPlaying
                ? <Pause className="w-5 h-5" />
                : <Play className="w-5 h-5" />}
          </button>

          {/* mute */}
          <button
            className="text-white hover:text-emerald-300 transition-colors p-1"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* time counter */}
          <span className="text-white/70 text-xs font-mono tabular-nums">
            {fmt(curTime - startSeconds)} / {fmt(clipLen)}
          </span>

          <div className="flex-1" />

          {/* channel badge */}
          {channelTitle && (
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-2.5 py-[3px]">
              <span className="text-emerald-300 text-[11px] font-semibold tracking-wide">
                {channelTitle}
              </span>
            </div>
          )}

          {/* fullscreen */}
          <button
            className="text-white hover:text-emerald-300 transition-colors p-1 ml-1"
            onClick={handleFullscreen}
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
