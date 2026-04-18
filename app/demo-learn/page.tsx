"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Hand, Menu, X, Loader2, BookOpen, Users, Info, Home, Play, Volume2, ChevronDown } from "lucide-react"
import { DeafAccessibilityFeatures } from "@/components/deaf-accessibility-features"
import { VICModeToggle } from "@/components/vic-mode-toggle"
import { VICTeacherDashboard } from "@/components/vic-teacher-dashboard"
import { VICStudentDashboard } from "@/components/vic-student-dashboard"
import { buildAnimationSrcDoc } from "@/lib/educational-animation"
import { mockDemoGeneratedState } from "@/lib/figma-mock-data"
import { GeneratedAnimationPlayer } from "@/components/generated-animation-player"
import { YouTubeNativePlayer } from "@/components/youtube-native-player"

// Full Maharashtra State Board Curriculum (Std 6–8)
const CURRICULUM_DATA = {
  "6": {
    Science: {
      "Basic Life Processes": [
        "Nutrition in Plants",
        "Nutrition in Animals",
        "Respiration in Living Organisms",
        "Transportation in Plants and Animals",
        "Excretion in Living Organisms",
      ],
      "Living Organisms": [
        "Structure of Plants",
        "Structure of Animals",
        "Classification of Plants",
        "Classification of Animals",
        "Adaptation in Plants",
        "Adaptation in Animals",
      ],
      "Physical World": [
        "Light",
        "Sound",
        "Electricity and Its Effects",
        "Fun with Magnets",
        "Water",
        "Air Around Us",
      ],
    },
    Mathematics: {
      Numbers: [
        "Natural Numbers",
        "Whole Numbers",
        "Integers",
        "Fractions and Decimals",
        "Playing with Numbers",
      ],
      Algebra: ["Introduction to Algebra", "Simple Equations"],
      Geometry: [
        "Basic Geometrical Ideas",
        "Understanding Elementary Shapes",
        "Symmetry",
        "Practical Geometry",
      ],
      "Data Handling": ["Data Handling", "Mensuration", "Ratio and Proportion"],
    },
    "Social Science": {
      History: [
        "What, Where, How and When?",
        "From Hunting-Gathering to Growing Food",
        "In the Earliest Cities",
        "The Vedas and the Epics",
        "Kingdoms, Kings and an Early Republic",
      ],
      Geography: [
        "The Earth in the Solar System",
        "Globe — Latitudes and Longitudes",
        "Motions of the Earth",
        "Maps",
        "India — Climate, Vegetation and Wildlife",
      ],
    },
  },
  "7": {
    Science: {
      "Life Processes": [
        "Photosynthesis",
        "Respiration in Organisms",
        "Reproduction in Plants",
        "Reproduction in Animals",
        "Weather, Climate and Adaptations",
      ],
      "Human Body": [
        "Nutrition in Animals — Digestive System",
        "Skeletal System",
        "Muscular System",
        "Circulatory System",
        "Excretory System",
        "Nervous System",
      ],
      "Physical World": [
        "Heat",
        "Acids, Bases and Salts",
        "Physical and Chemical Changes",
        "Electric Current and Its Effects",
        "Light — Reflection and Refraction",
        "Motion and Time",
      ],
      "Natural Phenomena": [
        "Wind, Storms and Cyclones",
        "Soil",
        "Forests — Our Lifeline",
        "Wastewater Story",
      ],
    },
    Mathematics: {
      Algebra: [
        "Variables and Expressions",
        "Simple Equations",
        "Lines and Angles",
        "Rational Numbers",
      ],
      Geometry: [
        "Triangle and Its Properties",
        "Congruence of Triangles",
        "Comparing Quantities — Percentage",
        "Practical Geometry",
      ],
      "Data and Mensuration": [
        "Perimeter and Area",
        "Algebraic Expressions",
        "Exponents and Powers",
        "Symmetry",
        "Visualising Solid Shapes",
      ],
    },
    "Social Science": {
      History: [
        "Tracing Changes Through a Thousand Years",
        "New Kings and Kingdoms",
        "The Delhi Sultanate",
        "The Mughal Empire",
        "Rulers and Buildings",
        "Towns, Traders and Craftspersons",
      ],
      Geography: [
        "Environment",
        "Inside Our Earth",
        "Our Changing Earth",
        "Air",
        "Water",
        "Natural Vegetation and Wildlife",
        "Human Environment — Settlement, Transport and Communication",
      ],
    },
  },
  "8": {
    Science: {
      "Life Processes in Living Organisms": [
        "Human Digestive System",
        "Circulatory System",
        "Nervous System",
        "Endocrine System",
        "Reproductive System",
        "Cell Structure and Function",
      ],
      Ecology: [
        "Ecosystems",
        "Food Chain and Food Web",
        "Conservation of Plants and Animals",
        "Crop Production and Management",
        "Microorganisms",
        "Pollution of Air and Water",
      ],
      "Physical World": [
        "Force and Pressure",
        "Friction",
        "Sound — Vibration and Propagation",
        "Chemical Effects of Electric Current",
        "Synthetic Fibres and Plastics",
        "Metals and Non-Metals",
        "Coal and Petroleum",
        "Combustion and Flame",
        "Stars and the Solar System",
      ],
    },
    Mathematics: {
      "Numbers and Algebra": [
        "Rational Numbers",
        "Linear Equations in One Variable",
        "Direct and Inverse Proportions",
        "Squares and Square Roots",
        "Cubes and Cube Roots",
        "Comparing Quantities — Profit and Loss",
        "Algebraic Expressions and Identities",
        "Exponents and Powers",
      ],
      Geometry: [
        "Quadrilaterals — Understanding Shapes",
        "Triangles — Congruence and Similarity",
        "Practical Geometry — Constructions",
        "Visualising 3D Shapes",
        "Mensuration — Area and Volume",
      ],
      "Data and Statistics": [
        "Data Handling",
        "Introduction to Graphs",
        "Playing with Numbers",
      ],
    },
    "Social Science": {
      History: [
        "How, When and Where",
        "From Trade to Territory",
        "Ruling the Countryside",
        "Tribals, Dikus and the Vision of a Golden Age",
        "When People Rebel — 1857 and After",
        "Weavers, Iron Smelters and Factory Owners",
        "Civilising the Native, Educating the Nation",
        "The Making of the National Movement",
        "India After Independence",
      ],
      Geography: [
        "Resources and Development",
        "Land, Soil, Water, Natural Vegetation and Wildlife Resources",
        "Agriculture",
        "Industries",
        "Human Resources",
      ],
    },
  },
}

const CONTENT_GENERATION_TIMEOUT_MS = 180000

function DemoLearnContent() {
  const searchParams = useSearchParams()
  const [selectedStandard, setSelectedStandard] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedChapter, setSelectedChapter] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")

  const [isGenerating, setIsGenerating] = useState(false)
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
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"content" | "images" | "videos" | "accessibility">("content")
  const [visualTranscript, setVisualTranscript] = useState<string | null>(null)

  // VIC Mode State
  const [vicMode, setVicMode] = useState<"off" | "teacher" | "student">("off")

  const handleVicModeSelect = (mode: "teacher" | "student") => {
    setVicMode(mode)
  }

  const handleVicModeClose = () => {
    setVicMode("off")
  }

  useEffect(() => {
    const figmaMock = searchParams.get("figmaMock")
    if (!figmaMock) return

    if (figmaMock === "generated") {
      setSelectedStandard(mockDemoGeneratedState.selectedStandard)
      setSelectedSubject(mockDemoGeneratedState.selectedSubject)
      setSelectedChapter(mockDemoGeneratedState.selectedChapter)
      setSelectedTopic(mockDemoGeneratedState.selectedTopic)
      setExplanation(mockDemoGeneratedState.explanation)
      setImageUrl(mockDemoGeneratedState.imageUrl)
      setDetailedIllustrationSVG(mockDemoGeneratedState.detailedIllustrationSVG)
      setAnimationUrl(mockDemoGeneratedState.animationUrl)
      setAnimationCode(null)
      setSignLanguageSVG(mockDemoGeneratedState.signLanguageSVG)
      setVisualTranscript(mockDemoGeneratedState.visualTranscript)
      setError(null)
      setActiveTab(
        (searchParams.get("tab") as "content" | "images" | "videos" | "accessibility" | null) ?? "content",
      )
    }

    const mode = searchParams.get("mode")
    if (mode === "teacher" || mode === "student") {
      setVicMode(mode)
    }
  }, [searchParams])

  // Get available options based on selections
  const standards = Object.keys(CURRICULUM_DATA)
  const subjects = selectedStandard
    ? Object.keys(CURRICULUM_DATA[selectedStandard as keyof typeof CURRICULUM_DATA])
    : []
  const chapters =
    selectedStandard && selectedSubject
      ? Object.keys(CURRICULUM_DATA[selectedStandard as keyof typeof CURRICULUM_DATA][selectedSubject as keyof typeof CURRICULUM_DATA[keyof typeof CURRICULUM_DATA]] || {})
      : []
  const topics =
    selectedStandard && selectedSubject && selectedChapter
      ? (CURRICULUM_DATA[selectedStandard as keyof typeof CURRICULUM_DATA][
        selectedSubject as keyof typeof CURRICULUM_DATA[keyof typeof CURRICULUM_DATA]
      ] as Record<string, string[]>)[selectedChapter] || []
      : []

  // Reset dependent selections when parent selection changes
  const handleStandardChange = (std: string) => {
    setSelectedStandard(std)
    setSelectedSubject("")
    setSelectedChapter("")
    setSelectedTopic("")
    setExplanation(null)
  }

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject)
    setSelectedChapter("")
    setSelectedTopic("")
    setExplanation(null)
  }

  const handleChapterChange = (chapter: string) => {
    setSelectedChapter(chapter)
    setSelectedTopic("")
    setExplanation(null)
  }

  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic)
    setExplanation(null)
  }

  const handleGenerateContent = async () => {
    if (!selectedTopic) {
      setError("Please select a topic first")
      return
    }

    setIsGenerating(true)
    setError(null)
    // Reset all content
    setExplanation(null)
    setImageUrl(null)
    setDetailedIllustrationSVG(null)
    setAnimationUrl(null)
    setAnimationCode(null)
    setSignLanguageSVG(null)
    setVisualTranscript(null)
    setYoutubeVideo(null)

    let timeoutId: ReturnType<typeof setTimeout> | undefined
    let didTimeout = false

    try {
      console.log("[Demo Learn] Starting content generation for topic:", selectedTopic)

      const controller = new AbortController()
      timeoutId = setTimeout(() => {
        didTimeout = true
        controller.abort()
      }, CONTENT_GENERATION_TIMEOUT_MS)

      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          chapter: selectedChapter,
          standard: selectedStandard,
          subject: selectedSubject,
        }),
        signal: controller.signal,
      })

      console.log("[Demo Learn] API Response status:", res.status)

      let data
      try {
        data = await res.json()
      } catch (jsonError) {
        console.error("[Demo Learn] Failed to parse JSON response:", jsonError)
        throw new Error(`Server response error: ${res.status} ${res.statusText}`)
      }

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: Failed to generate content`)
      }

      console.log("[Demo Learn] Content generated:", {
        hasExplanation: !!data.explanation,
        hasYouTube: !!data.youtubeVideo,
        hasAnimation: !!data.animationUrl,
        hasSVG: !!data.detailedIllustrationSVG,
      })

      setExplanation(data.explanation)
      setSignLanguageSVG(data.signLanguageSVG || null)
      setVisualTranscript(data.visualTranscript || null)
      setImageUrl(data.imageUrl || null)
      setDetailedIllustrationSVG(data.detailedIllustrationSVG || null)
      setAnimationUrl(data.animationUrl || null)
      setAnimationCode(data.animationCode || null)
      setYoutubeVideo(data.youtubeVideo || null)

      // Auto-switch to videos tab when we have a YouTube video
      if (data.youtubeVideo) {
        setActiveTab("videos")
      } else {
        setActiveTab("content")
      }
    } catch (err) {
      const errorMessage =
        didTimeout || (err instanceof DOMException && err.name === "AbortError")
          ? "Content generation took too long. Please try again."
          : err instanceof Error
            ? err.message
            : "Failed to generate content"
      setError(errorMessage)
      console.error("[Demo Learn] Error:", errorMessage, err)
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Hand className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Silent Classroom</span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm hover:text-primary transition-colors gap-2 flex items-center">
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="#" className="text-sm hover:text-primary transition-colors gap-2 flex items-center">
              <BookOpen className="w-4 h-4" />
              Topics
            </Link>
            <Link href="#" className="text-sm hover:text-primary transition-colors gap-2 flex items-center">
              <Volume2 className="w-4 h-4" />
              AI Content
            </Link>
            <Link href="#" className="text-sm hover:text-primary transition-colors gap-2 flex items-center">
              <Info className="w-4 h-4" />
              About
            </Link>
            <div className="flex items-center gap-3 pl-6 border-l border-border">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium">Demo Student</p>
                <p className="text-xs text-muted-foreground">Demo Mode</p>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <nav className="container mx-auto px-4 py-4 space-y-3">
              <Link href="/" className="block text-sm hover:text-primary py-2">
                Dashboard
              </Link>
              <Link href="#" className="block text-sm hover:text-primary py-2">
                Topics
              </Link>
              <Link href="#" className="block text-sm hover:text-primary py-2">
                AI Content
              </Link>
              <Link href="#" className="block text-sm hover:text-primary py-2">
                About
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Syllabus Selection Card */}
        <Card className="mb-8 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">Select Your Learning Path</CardTitle>
            <CardDescription>
              Choose Standard, Subject, Chapter, and Topic to generate educational content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Standard Dropdown */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-semibold uppercase">Standard</label>
                <div className="relative">
                  <select
                    value={selectedStandard}
                    onChange={(e) => handleStandardChange(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm appearance-none cursor-pointer pr-8"
                  >
                    <option value="">Select Standard</option>
                    {standards.map((std) => (
                      <option key={std} value={std}>
                        Standard {std}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                </div>
              </div>

              {/* Subject Dropdown */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-semibold uppercase">Subject</label>
                <div className="relative">
                  <select
                    value={selectedSubject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    disabled={!selectedStandard}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm appearance-none cursor-pointer pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                </div>
              </div>

              {/* Chapter Dropdown */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-semibold uppercase">Chapter</label>
                <div className="relative">
                  <select
                    value={selectedChapter}
                    onChange={(e) => handleChapterChange(e.target.value)}
                    disabled={!selectedSubject}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm appearance-none cursor-pointer pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map((chapter) => (
                      <option key={chapter} value={chapter}>
                        {chapter}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                </div>
              </div>

              {/* Topic Dropdown */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-semibold uppercase">Topic</label>
                <div className="relative">
                  <select
                    value={selectedTopic}
                    onChange={(e) => handleTopicChange(e.target.value)}
                    disabled={!selectedChapter}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm appearance-none cursor-pointer pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Topic</option>
                    {topics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate Button and VIC Mode Toggle */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <Button
            onClick={handleGenerateContent}
            disabled={isGenerating || !selectedTopic}
            size="lg"
            className="w-full md:w-auto text-base h-12 gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Educational Content...
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" />
                Generate Educational Content
              </>
            )}
          </Button>

          {/* VIC Mode Toggle */}
          <VICModeToggle onModeSelect={handleVicModeSelect} />
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
            <CardContent className="pt-6">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* VIC Mode Dashboards */}
        {vicMode === "teacher" && <VICTeacherDashboard onClose={handleVicModeClose} />}
        {vicMode === "student" && <VICStudentDashboard onClose={handleVicModeClose} />}

        {/* Regular Content Generation (show only when VIC mode is off) */}
        {vicMode === "off" && (
          <>
            {/* Tabs for Content Sections */}
            {explanation && (
              <div className="space-y-6">
                <div className="flex gap-2 border-b border-border overflow-x-auto">
                  {["content", "images", "videos", "accessibility"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as typeof activeTab)}
                      className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {tab === "content" && "📖 Explanation"}
                      {tab === "images" && "🖼️ Images"}
                      {tab === "videos" && "▶️ Videos"}
                      {tab === "accessibility" && "♿ Accessibility"}
                    </button>
                  ))}
                </div>

                {/* Explanation Content */}
                {activeTab === "content" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Educational Explanation</CardTitle>
                      <CardDescription>AI-generated content for {selectedTopic}</CardDescription>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none">
                      <div className="space-y-4 text-base leading-relaxed text-foreground whitespace-pre-wrap">
                        {explanation}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Images Section */}
                {activeTab === "images" && (() => {
                  const hasImageResource = Boolean(imageUrl)
                  // Only use SVG if it actually has real drawn content (not empty/description text)
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
                        <CardDescription>Visual learning content for {selectedTopic}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {hasImageResource ? (
                          <div className="space-y-4">
                            <img
                              src={imageUrl!}
                              alt={selectedTopic}
                              className="w-full rounded-lg border shadow-inner object-contain bg-white"
                              style={{ maxHeight: '600px' }}
                            />
                            <p className="text-sm text-muted-foreground">
                              🖼️ Educational diagram of {selectedTopic}
                            </p>
                          </div>
                        ) : hasRealSVG ? (
                          /* 2nd priority: AI-generated SVG diagram with real drawn content */
                          <div className="space-y-4">
                            <div
                              className="w-full rounded-lg overflow-hidden bg-white border shadow-inner flex items-center justify-center p-4"
                              style={{ minHeight: '400px' }}
                              dangerouslySetInnerHTML={{ __html: detailedIllustrationSVG! }}
                            />
                            <p className="text-sm text-muted-foreground">
                              🖼️ AI-generated educational diagram of {selectedTopic}
                            </p>
                          </div>
                        ) : animationUrl ? (
                          /* 3rd priority: show animation as visual reference when no dedicated image */
                          <div className="space-y-4">
                            <div className="relative w-full rounded-lg overflow-hidden bg-black border shadow-inner" style={{ paddingBottom: '75.56%' }}>
                              <GeneratedAnimationPlayer src={animationUrl} title={`${selectedTopic} Visual`} />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              🎬 Interactive visual animation for {selectedTopic} — also see the Videos tab
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

                {/* Videos/Animation Section */}
                {activeTab === "videos" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        ▶️ Educational Video
                        {youtubeVideo && (
                          <span className="text-xs font-normal bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                            ✨ Best animated match
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {youtubeVideo
                          ? `AI-selected animated video · ${youtubeVideo.channelTitle} · Smart-trimmed to show only the concept`
                          : `Visual content for ${selectedTopic}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {youtubeVideo ? (
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
                            <GeneratedAnimationPlayer src={animationUrl} title={`${selectedTopic} Animation`} />
                          </div>
                          <p className="text-sm text-muted-foreground">🎬 Pre-built interactive animation for {selectedTopic}</p>
                        </div>
                      ) : animationCode ? (
                        <div className="space-y-4">
                          <div className="relative w-full rounded-lg overflow-hidden bg-white border shadow-inner" style={{ paddingBottom: "75.56%" }}>
                            <iframe
                              srcDoc={buildAnimationSrcDoc(animationCode)}
                              className="absolute inset-0 w-full h-full border-0"
                              title="Generated Animation"
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">AI-generated visual animation of {selectedTopic}</p>
                        </div>
                      ) : (
                        <div className="py-12 text-center text-muted-foreground">
                          <p>No video found for this topic. Try a more specific concept or regenerate.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Accessibility Section */}
                {activeTab === "accessibility" && (
                  <DeafAccessibilityFeatures
                    topic={selectedTopic}
                    signLanguageSVG={signLanguageSVG || ""}
                    visualTranscript={visualTranscript || ""}
                  />
                )}
              </div>
            )}

            {/* Initial State */}
            {!explanation && !isGenerating && (
              <Card className="text-center py-16">
                <CardContent>
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Learn?</h3>
                  <p className="text-muted-foreground mb-6">
                    Select your learning path above and click "Generate Educational Content" to create an AI-powered visual
                    lesson, or use Live Voice-to-Content (VIC) mode for real-time content generation
                  </p>
                  <Button onClick={handleGenerateContent} disabled={!selectedTopic} size="lg" className="gap-2">
                    <Play className="w-5 h-5" />
                    Start Learning
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 mt-12">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Silent Classrooms. Demo Mode - No authentication required.</p>
          <p className="mt-2 text-xs">
            <Link href="/" className="hover:text-primary transition-colors">
              Back to Home
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
function PageLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
        <Hand className="w-7 h-7 text-primary-foreground" />
      </div>
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading lesson content...</p>
    </div>
  )
}

export default function DemoLearnPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <DemoLearnContent />
    </Suspense>
  )
}
