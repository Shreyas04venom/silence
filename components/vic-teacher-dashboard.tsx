"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
    Mic,
    MicOff,
    Pause,
    Play,
    StopCircle,
    Save,
    AlertTriangle,
    Loader2,
    CheckCircle2,
    Send,
    History,
} from "lucide-react"
import { VICStudentDashboard } from "./vic-student-dashboard"
import { speechRecognition } from "@/lib/speech-recognition"
import { saveSession, generateSessionId, VICSession } from "@/lib/session-storage"
import { DeafAccessibilityFeatures } from "@/components/deaf-accessibility-features"
import { buildAnimationSrcDoc } from "@/lib/educational-animation"
import { saveSessionToSupabase, flushQueue, getPendingQueueCount } from "@/lib/supabase-services"
import { YouTubeNativePlayer } from "@/components/youtube-native-player"
import { GeneratedAnimationPlayer } from "@/components/generated-animation-player"
import { OnboardingTour } from "@/components/onboarding-tour"
import { teacherDashboardTour, hasCompletedOnboarding, markOnboardingComplete } from "@/lib/onboarding-tours"

interface TeacherDashboardProps {
    onClose: () => void
}

const CONTENT_GENERATION_TIMEOUT_MS = 180000

export function VICTeacherDashboard({ onClose }: TeacherDashboardProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [interimTranscript, setInterimTranscript] = useState("")
    const [activeTab, setActiveTab] = useState<"explanation" | "images" | "videos" | "accessibility">(
        "explanation"
    )
    const [isViewingSessions, setIsViewingSessions] = useState(false)
    const [showOnboarding, setShowOnboarding] = useState(false)

    // Generated content (matching generate-content API response shape)
    const [explanation, setExplanation] = useState<string | null>(null)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [detailedIllustrationSVG, setDetailedIllustrationSVG] = useState<string | null>(null)
    const [animationCode, setAnimationCode] = useState<string | null>(null)
    const [animationUrl, setAnimationUrl] = useState<string | null>(null)
    const [signLanguageSVG, setSignLanguageSVG] = useState<string | null>(null)
    const [youtubeVideo, setYoutubeVideo] = useState<{
        videoId: string
        title: string
        channelTitle: string
        startSeconds: number
        endSeconds: number
        thumbnailUrl: string
    } | null>(null)
    const [visualTranscript, setVisualTranscript] = useState<string | null>(null)

    // Session data
    const sessionIdRef = useRef<string>(generateSessionId())
    const startTimeRef = useRef<number>(0)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationError, setGenerationError] = useState<string | null>(null)
    const [hasGenerated, setHasGenerated] = useState(false)
    // Cloud sync status: null = idle, 'saving' = in progress, 'saved' = success, 'queued' = offline
    const [saveStatus, setSaveStatus] = useState<null | 'saving' | 'saved' | 'queued'>(null)

    useEffect(() => {
        // Flush any offline-queued sessions silently on dashboard open
        flushQueue().catch(() => null)

        // Check if user needs onboarding
        if (!hasCompletedOnboarding("teacher")) {
            setShowOnboarding(true)
        }

        return () => {
            if (isRecording) {
                speechRecognition.stop()
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleStartRecording = () => {
        if (!speechRecognition.isSupported()) {
            return
        }

        setTranscript("")
        setInterimTranscript("")
        startTimeRef.current = Date.now()

        speechRecognition.start({
            continuous: true,
            interimResults: true,
            onResult: (result) => {
                if (result.isFinal) {
                    // result.transcript is the FULL accumulated transcript from the speech recognition library
                    setTranscript(result.transcript)
                    setInterimTranscript("")
                } else {
                    setInterimTranscript(result.transcript)
                }
            },
            onError: (error) => {
                console.error("Speech recognition error:", error)
            },
            onEnd: () => {
                if (!isPaused) {
                    setIsRecording(false)
                }
            },
        })

        setIsRecording(true)
        setIsPaused(false)
    }

    const handlePauseRecording = () => {
        speechRecognition.pause()
        setIsPaused(true)
    }

    const handleResumeRecording = () => {
        speechRecognition.resume()
        setIsPaused(false)
    }

    const handleStopRecording = () => {
        speechRecognition.stop()
        setIsRecording(false)
        setIsPaused(false)
    }

    const handleSaveSession = async () => {
        const duration = Date.now() - startTimeRef.current

        // Get current user from Firebase
        const { auth } = await import('@/lib/firebase')
        const currentUser = auth?.currentUser

        const session: VICSession = {
            id: sessionIdRef.current,
            title: `Session ${new Date().toLocaleString()}`,
            timestamp: startTimeRef.current,
            duration,
            transcript: transcript.trim(),
            translations: {},
            images: imageUrl ? [imageUrl] : [],
            animations: animationCode ? [animationCode] : [],
            videos: youtubeVideo ? [youtubeVideo.videoId] : [], // Save YouTube video ID
            // Save all generated content
            explanation: explanation || undefined,
            imageUrl: imageUrl || undefined,
            detailedIllustrationSVG: detailedIllustrationSVG || undefined,
            animationCode: animationCode || undefined,
            animationUrl: animationUrl || undefined,
            signLanguageSVG: signLanguageSVG || undefined,
            accessibility: {
                visualTranscript: visualTranscript || "",
                signLanguageData: youtubeVideo ? [{
                    videoId: youtubeVideo.videoId,
                    title: youtubeVideo.title,
                    channelTitle: youtubeVideo.channelTitle,
                    startSeconds: youtubeVideo.startSeconds,
                    endSeconds: youtubeVideo.endSeconds
                }] : [],
            },
            metadata: {
                teacher: currentUser?.displayName || currentUser?.email || "Teacher",
                topic: transcript.trim().split(/\s+/).slice(0, 5).join(" "),
            },
            // Session sharing - mark teacher sessions as public
            createdBy: currentUser?.uid,
            createdByRole: 'teacher',
            isPublic: true, // Teacher sessions are visible to all students
        }

        saveSession(session)

        // Sync to cloud silently — never blocks the UI, never shows errors
        setSaveStatus('saving')
        saveSessionToSupabase(session)
            .then((synced) => {
                setSaveStatus(synced ? 'saved' : 'queued')
                // Auto-clear the status badge after 4 seconds
                setTimeout(() => setSaveStatus(null), 4000)
            })
            .catch(() => {
                setSaveStatus('queued')
                setTimeout(() => setSaveStatus(null), 4000)
            })
    }

    // Single unified API call — same endpoint as "Generate Educational Content" button
    const handleSubmitAndGenerate = async () => {
        const conceptText = transcript.trim()
        if (!conceptText) {
            setGenerationError("Please speak or type a concept first.")
            return
        }

        // Stop recording if still active
        if (isRecording) {
            handleStopRecording()
        }

        setIsGenerating(true)
        setGenerationError(null)
        setHasGenerated(false)

        // Reset previous content
        setExplanation(null)
        setImageUrl(null)
        setDetailedIllustrationSVG(null)
        setAnimationCode(null)
        setAnimationUrl(null)
        setSignLanguageSVG(null)
        setVisualTranscript(null)
        setYoutubeVideo(null)

        let timeoutId: ReturnType<typeof setTimeout> | undefined
        let didTimeout = false

        try {
            const controller = new AbortController()
            timeoutId = setTimeout(() => {
                didTimeout = true
                controller.abort()
            }, CONTENT_GENERATION_TIMEOUT_MS)

            const res = await fetch("/api/generate-content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic: conceptText,
                    chapter: "",
                    standard: "",
                    subject: "",
                }),
                signal: controller.signal,
            })

            let data
            try {
                data = await res.json()
            } catch (jsonError) {
                throw new Error(`Server response error: ${res.status} ${res.statusText}`)
            }

            if (!res.ok) {
                throw new Error(data.error || `HTTP ${res.status}: Failed to generate content`)
            }

            // Map response to state
            setExplanation(data.explanation || null)
            setImageUrl(data.imageUrl || null)
            setDetailedIllustrationSVG(data.detailedIllustrationSVG || null)
            setAnimationUrl(data.animationUrl || null)
            setAnimationCode(data.animationCode || null)
            setSignLanguageSVG(data.signLanguageSVG || null)
            setVisualTranscript(data.visualTranscript || null)
            setYoutubeVideo(data.youtubeVideo || null)
            setHasGenerated(true)
            // Always keep the user in the explanation tab when content is generated
            setActiveTab("explanation")
        } catch (err) {
            const errorMessage =
                didTimeout || (err instanceof DOMException && err.name === "AbortError")
                    ? "Content generation took too long. Please try again, or speak a shorter concept first and then continue."
                    : err instanceof Error
                      ? err.message
                      : "Failed to generate content"
            setGenerationError(errorMessage)
            console.error("[VIC] Content generation error:", errorMessage, err)
        } finally {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
            setIsGenerating(false)
        }
    }

    const conceptText = transcript.trim()

    if (isViewingSessions) {
        return (
            <VICStudentDashboard 
                isTeacher={true} 
                onClose={() => setIsViewingSessions(false)} 
            />
        )
    }

    return (
        <>
            {showOnboarding && (
                <OnboardingTour
                    steps={teacherDashboardTour}
                    tourName="teacher-dashboard"
                    onComplete={() => {
                        markOnboardingComplete("teacher")
                        setShowOnboarding(false)
                    }}
                    onSkip={() => {
                        markOnboardingComplete("teacher")
                        setShowOnboarding(false)
                    }}
                />
            )}
            
            <div className="space-y-6" data-tour="welcome">
            {/* Recording Controls */}
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <Mic className={isRecording ? "animate-pulse text-red-500" : ""} />
                        Teacher Live Recording
                        {isGenerating && (
                            <span className="flex items-center gap-2 text-sm font-normal text-blue-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating content...
                            </span>
                        )}
                        {hasGenerated && !isGenerating && (
                            <span className="flex items-center gap-2 text-sm font-normal text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                Content generated!
                            </span>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Speak your educational concept, then click &quot;Submit &amp; Generate Content&quot; to create visual learning materials.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3" data-tour="record-button">
                        {!isRecording ? (
                            <Button onClick={handleStartRecording} size="lg" className="gap-2 bg-green-600 hover:bg-green-700">
                                <Mic className="w-5 h-5" />
                                Start Recording
                            </Button>
                        ) : (
                            <>
                                {!isPaused ? (
                                    <Button onClick={handlePauseRecording} size="lg" className="gap-2 bg-yellow-600 hover:bg-yellow-700">
                                        <Pause className="w-5 h-5" />
                                        Pause
                                    </Button>
                                ) : (
                                    <Button onClick={handleResumeRecording} size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                                        <Play className="w-5 h-5" />
                                        Resume
                                    </Button>
                                )}
                                <Button onClick={handleStopRecording} size="lg" variant="destructive" className="gap-2">
                                    <StopCircle className="w-5 h-5" />
                                    Stop
                                </Button>
                            </>
                        )}

                        {/* Submit & Generate button */}
                        <Button
                            onClick={handleSubmitAndGenerate}
                            size="lg"
                            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                            disabled={isGenerating || !conceptText}
                            data-tour="generate-button"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Submit &amp; Generate Content
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={handleSaveSession}
                            size="lg"
                            variant="outline"
                            className="gap-2"
                            disabled={!conceptText}
                            data-tour="save-button"
                        >
                            {saveStatus === 'saving' ? (
                                <><Loader2 className="w-5 h-5 animate-spin" />Saving…</>
                            ) : saveStatus === 'saved' ? (
                                <><CheckCircle2 className="w-5 h-5 text-emerald-500" />Saved ✓</>
                            ) : saveStatus === 'queued' ? (
                                <><Save className="w-5 h-5" />Saved Locally</>
                            ) : (
                                <><Save className="w-5 h-5" />Save Session</>
                            )}
                        </Button>
                        {/* Quiet status pill — auto-disappears after 4s */}
                        {saveStatus === 'saved' && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
                                ✓ Synced to cloud
                            </span>
                        )}
                        {saveStatus === 'queued' && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium animate-in fade-in">
                                📦 Saved locally — will sync when online
                            </span>
                        )}
                        <Button
                            onClick={() => setIsViewingSessions(!isViewingSessions)}
                            size="lg"
                            variant="secondary"
                            className="gap-2"
                            data-tour="sessions-button"
                        >
                            {isViewingSessions ? (
                                <>
                                    <Mic className="w-5 h-5" />
                                    Back to Recording
                                </>
                            ) : (
                                <>
                                    <History className="w-5 h-5" />
                                    Manage Saved Lessons
                                </>
                            )}
                        </Button>
                        <Button onClick={onClose} size="lg" variant="ghost">
                            Close VIC Mode
                        </Button>
                    </div>

                    {/* Live Transcript (editable) */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 min-h-[100px] max-h-[200px] overflow-y-auto" data-tour="transcript">
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Badge variant={isRecording ? "default" : "secondary"}>
                                {isRecording ? "Recording..." : "Stopped"}
                            </Badge>
                            Live Transcript
                        </p>
                        <textarea
                            className="w-full min-h-[60px] bg-transparent border-0 outline-none resize-none text-base"
                            value={transcript + (interimTranscript ? " " + interimTranscript : "")}
                            onChange={(e) => {
                                setTranscript(e.target.value)
                                setInterimTranscript("")
                            }}
                            placeholder="Speak your educational concept, or type it here..."
                        />
                    </div>

                    {/* Error message */}
                    {generationError && (
                        <Alert variant="destructive" className="border-red-500 bg-red-50 dark:bg-red-950">
                            <AlertTriangle className="h-5 w-5" />
                            <AlertTitle>Generation Error</AlertTitle>
                            <AlertDescription>{generationError}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Generated Content Tabs */}
            {(explanation || isGenerating) && (
                <div className="space-y-4">
                    <div className="flex gap-2 border-b border-border overflow-x-auto" data-tour="tabs">
                        {["explanation", "images", "videos", "accessibility"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as typeof activeTab)}
                                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                                    ? "border-purple-500 text-purple-600"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {tab === "explanation" && "📖 Explanation"}
                                {tab === "images" && "🖼️ Images"}
                                {tab === "videos" && "▶️ Videos"}
                                {tab === "accessibility" && "♿ Accessibility"}
                            </button>
                        ))}
                    </div>

                    {/* Explanation Tab */}
                    {activeTab === "explanation" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Live Explanation</CardTitle>
                                <CardDescription>AI-generated educational content from your speech</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isGenerating ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                        Generating explanation...
                                    </div>
                                ) : explanation ? (
                                    <div className="prose dark:prose-invert max-w-none">
                                        <div className="space-y-4 text-base leading-relaxed text-foreground whitespace-pre-wrap">
                                            {explanation}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No explanation generated yet. Click &quot;Submit &amp; Generate Content&quot; above.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Images Tab */}
                    {activeTab === "images" && (() => {
                        const hasImageResource = Boolean(imageUrl)
                        const hasRealSVG = !hasImageResource && detailedIllustrationSVG &&
                            detailedIllustrationSVG.trim().startsWith('<') &&
                            (detailedIllustrationSVG.includes('<rect') || detailedIllustrationSVG.includes('<circle') ||
                                detailedIllustrationSVG.includes('<path') || detailedIllustrationSVG.includes('<ellipse') ||
                                detailedIllustrationSVG.includes('<polygon')) &&
                            detailedIllustrationSVG.length > 200

                        return (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Visual Resources</CardTitle>
                                    <CardDescription>AI-generated educational images from your speech</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isGenerating ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                            Generating images...
                                        </div>
                                    ) : hasImageResource ? (
                                        <div className="space-y-4">
                                            <img
                                                src={imageUrl!}
                                                alt={conceptText}
                                                className="w-full rounded-lg border shadow-inner object-contain bg-white"
                                                style={{ maxHeight: '600px' }}
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                🖼️ Educational diagram for: {conceptText}
                                            </p>
                                        </div>
                                    ) : hasRealSVG ? (
                                        <div className="space-y-4">
                                            <div
                                                className="w-full rounded-lg overflow-hidden bg-white border shadow-inner flex items-center justify-center p-4"
                                                style={{ minHeight: '400px' }}
                                                dangerouslySetInnerHTML={{ __html: detailedIllustrationSVG! }}
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                🖼️ AI-generated educational diagram for: {conceptText}
                                            </p>
                                        </div>
                                    ) : animationUrl ? (
                                        <div className="space-y-4">
                                            <div className="relative w-full rounded-lg overflow-hidden bg-black border shadow-inner" style={{ paddingBottom: '75.56%' }}>
                                                <GeneratedAnimationPlayer src={animationUrl} title={`${conceptText} Visual`} />
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                🎬 Interactive visual animation — also see the Videos tab
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center text-muted-foreground">
                                            <p>No visual resources available. Try regenerating content.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })()}

                    {/* Videos/Animations Tab */}
                    {activeTab === "videos" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    ▶️ Educational Video
                                    {youtubeVideo && (
                                        <span className="text-xs font-normal bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                                            ✨ Best animated match found
                                        </span>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    {youtubeVideo
                                        ? `AI-selected animated video · ${youtubeVideo.channelTitle} · Smart-trimmed to show only the concept`
                                        : "Visual concept animation from your speech"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isGenerating ? (
                                    <div className="text-center py-12 text-muted-foreground space-y-3">
                                        <Loader2 className="w-10 h-10 animate-spin mx-auto" />
                                        <p className="text-base font-medium">Searching for best animated video...</p>
                                        <p className="text-sm opacity-70">AI is finding and trimming the perfect clip for this topic</p>
                                    </div>
                                ) : youtubeVideo ? (
                                    <div className="space-y-3">
                                        <YouTubeNativePlayer
                                            videoId={youtubeVideo.videoId}
                                            title={youtubeVideo.title}
                                            channelTitle={youtubeVideo.channelTitle}
                                            startSeconds={youtubeVideo.startSeconds}
                                            endSeconds={youtubeVideo.endSeconds}
                                        />
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate">{youtubeVideo.title}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{youtubeVideo.channelTitle}</p>
                                            </div>
                                            <div className="text-xs text-muted-foreground shrink-0">
                                                🎯 {Math.round(youtubeVideo.endSeconds - youtubeVideo.startSeconds)}s clip
                                            </div>
                                        </div>
                                    </div>
                                ) : animationUrl ? (
                                    <div className="space-y-4">
                                        <div className="relative w-full rounded-lg overflow-hidden bg-black border shadow-inner" style={{ paddingBottom: '75.56%' }}>
                                            <GeneratedAnimationPlayer src={animationUrl} title={`${conceptText} Animation`} />
                                        </div>
                                        <p className="text-sm text-muted-foreground">🎬 Pre-built interactive animation</p>
                                    </div>
                                ) : animationCode ? (
                                    <div className="space-y-4">
                                        <div className="relative w-full rounded-lg overflow-hidden bg-white border shadow-inner" style={{ paddingBottom: '75.56%' }}>
                                            <iframe
                                                srcDoc={buildAnimationSrcDoc(animationCode)}
                                                className="absolute inset-0 w-full h-full border-0"
                                                title="Generated Animation"
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground">AI-generated visual animation</p>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-muted-foreground">
                                        <p>No video found for this topic. Try a more specific concept.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Accessibility Tab */}
                    {activeTab === "accessibility" && (
                        isGenerating ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Accessibility Features</CardTitle>
                                    <CardDescription>Visual transcripts and sign language support</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                        Generating accessibility features...
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <DeafAccessibilityFeatures
                                topic={conceptText}
                                signLanguageSVG={signLanguageSVG || ""}
                                visualTranscript={visualTranscript || ""}
                            />
                        )
                    )}
                </div>
            )}

            {/* Initial state - no content yet */}
            {!explanation && !isGenerating && (
                <Card className="text-center py-12">
                    <CardContent>
                        <Mic className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Ready to Create Content</h3>
                        <p className="text-muted-foreground mb-4">
                            Click &quot;Start Recording&quot; and speak your educational concept, or type it directly.
                            <br />
                            Then click &quot;Submit &amp; Generate Content&quot; to create visual learning materials.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
        </>
    )
}
