import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini with key rotation
const keys = (process.env.GEMINI_API_KEY || "")
  .split(",")
  .map((key) => key.trim())
  .filter((key) => key.length > 0)

if (keys.length === 0) {
  console.warn("No GEMINI_API_KEY configured")
}

export interface GeneratedContent {
  explanation: string
  imagePrompt: string
  detailedIllustrationSVG: string
  signLanguageSVG: string
  visualTranscript: string
}

export interface AnimationStoryboardStep {
  title: string
  detail: string
}

export interface AnimationStoryboard {
  displayTitle: string
  subtitle: string
  steps: AnimationStoryboardStep[]
  keyTerms: string[]
  flow: string
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function buildContextDescriptor(standard: string, subject: string, chapter: string): string {
  const parts = []
  if (standard) parts.push(`standard ${cleanText(standard)}`)
  if (subject) parts.push(cleanText(subject))
  if (chapter) parts.push(cleanText(chapter))
  return parts.filter(Boolean).join(", ")
}

function buildFallbackVisualTranscript(displayTitle: string): string {
  return [
    `0:00 - ${displayTitle} appears with the main idea`,
    `0:04 - The first important input or starting condition is shown`,
    `0:08 - The key process or transformation happens step by step`,
    `0:12 - The final result and takeaway are highlighted clearly`,
  ].join("\n")
}

function buildFallbackDetailedIllustrationSVG(displayTitle: string, contextDescriptor: string): string {
  const title = escapeXml(displayTitle)
  const subtitle = escapeXml(contextDescriptor || "Simple visual concept map")

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="${title} concept diagram">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ecfeff"/>
      <stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#0f172a" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="800" height="500" fill="url(#bg)" rx="28"/>
  <text x="400" y="58" text-anchor="middle" font-size="30" font-weight="700" fill="#0f172a" font-family="Arial, sans-serif">${title}</text>
  <text x="400" y="84" text-anchor="middle" font-size="14" fill="#334155" font-family="Arial, sans-serif">${subtitle}</text>

  <rect x="70" y="150" width="180" height="90" rx="18" fill="#ffffff" stroke="#38bdf8" stroke-width="3" filter="url(#shadow)"/>
  <text x="160" y="185" text-anchor="middle" font-size="20" font-weight="700" fill="#0369a1" font-family="Arial, sans-serif">Input</text>
  <text x="160" y="212" text-anchor="middle" font-size="13" fill="#0f172a" font-family="Arial, sans-serif">Starting idea or cause</text>

  <rect x="310" y="126" width="180" height="120" rx="26" fill="#d1fae5" stroke="#22c55e" stroke-width="3" filter="url(#shadow)"/>
  <circle cx="400" cy="186" r="36" fill="#22c55e" opacity="0.18"/>
  <text x="400" y="180" text-anchor="middle" font-size="22" font-weight="700" fill="#166534" font-family="Arial, sans-serif">Process</text>
  <text x="400" y="208" text-anchor="middle" font-size="13" fill="#14532d" font-family="Arial, sans-serif">Main action happens here</text>

  <rect x="550" y="150" width="180" height="90" rx="18" fill="#ffffff" stroke="#f59e0b" stroke-width="3" filter="url(#shadow)"/>
  <text x="640" y="185" text-anchor="middle" font-size="20" font-weight="700" fill="#b45309" font-family="Arial, sans-serif">Output</text>
  <text x="640" y="212" text-anchor="middle" font-size="13" fill="#0f172a" font-family="Arial, sans-serif">Visible result or effect</text>

  <rect x="205" y="320" width="390" height="108" rx="24" fill="#0f172a" opacity="0.92" filter="url(#shadow)"/>
  <text x="400" y="360" text-anchor="middle" font-size="20" font-weight="700" fill="#f8fafc" font-family="Arial, sans-serif">Concept Flow</text>
  <text x="400" y="388" text-anchor="middle" font-size="14" fill="#cbd5e1" font-family="Arial, sans-serif">Input -> Process -> Output</text>
  <text x="400" y="412" text-anchor="middle" font-size="13" fill="#93c5fd" font-family="Arial, sans-serif">Use this as a clean classroom visual fallback</text>

  <path d="M250 195 C280 195 285 186 310 186" stroke="#38bdf8" stroke-width="5" fill="none" stroke-linecap="round"/>
  <polygon points="306,176 330,186 306,196" fill="#38bdf8"/>
  <path d="M490 186 C515 186 520 195 550 195" stroke="#f59e0b" stroke-width="5" fill="none" stroke-linecap="round"/>
  <polygon points="546,185 570,195 546,205" fill="#f59e0b"/>
</svg>`.trim()
}

function buildFallbackSignLanguageSVG(displayTitle: string): string {
  const title = escapeXml(displayTitle)

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 400" role="img" aria-label="${title} sign language guide">
  <rect width="700" height="400" rx="24" fill="#f8fafc"/>
  <text x="350" y="42" text-anchor="middle" font-size="28" font-weight="700" fill="#0f172a" font-family="Arial, sans-serif">${title}</text>
  <text x="350" y="68" text-anchor="middle" font-size="13" fill="#475569" font-family="Arial, sans-serif">Four clean signing steps for classroom explanation</text>

  <rect x="35" y="100" width="145" height="180" rx="18" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
  <rect x="195" y="100" width="145" height="180" rx="18" fill="#ecfccb" stroke="#65a30d" stroke-width="2"/>
  <rect x="355" y="100" width="145" height="180" rx="18" fill="#fff7ed" stroke="#f97316" stroke-width="2"/>
  <rect x="515" y="100" width="145" height="180" rx="18" fill="#f5f3ff" stroke="#8b5cf6" stroke-width="2"/>

  <text x="107" y="130" text-anchor="middle" font-size="18" font-weight="700" fill="#1d4ed8" font-family="Arial, sans-serif">1. Observe</text>
  <text x="267" y="130" text-anchor="middle" font-size="18" font-weight="700" fill="#4d7c0f" font-family="Arial, sans-serif">2. Point</text>
  <text x="427" y="130" text-anchor="middle" font-size="18" font-weight="700" fill="#c2410c" font-family="Arial, sans-serif">3. Show</text>
  <text x="587" y="130" text-anchor="middle" font-size="18" font-weight="700" fill="#6d28d9" font-family="Arial, sans-serif">4. Result</text>

  <circle cx="107" cy="190" r="26" fill="#fde68a"/><rect x="92" y="220" width="30" height="34" rx="14" fill="#fcd34d"/>
  <circle cx="267" cy="190" r="26" fill="#bbf7d0"/><rect x="252" y="220" width="30" height="34" rx="14" fill="#86efac"/>
  <circle cx="427" cy="190" r="26" fill="#fed7aa"/><rect x="412" y="220" width="30" height="34" rx="14" fill="#fdba74"/>
  <circle cx="587" cy="190" r="26" fill="#ddd6fe"/><rect x="572" y="220" width="30" height="34" rx="14" fill="#c4b5fd"/>

  <text x="107" y="305" text-anchor="middle" font-size="12" fill="#334155" font-family="Arial, sans-serif">Show the main object</text>
  <text x="267" y="305" text-anchor="middle" font-size="12" fill="#334155" font-family="Arial, sans-serif">Point to key part</text>
  <text x="427" y="305" text-anchor="middle" font-size="12" fill="#334155" font-family="Arial, sans-serif">Act out the process</text>
  <text x="587" y="305" text-anchor="middle" font-size="12" fill="#334155" font-family="Arial, sans-serif">Finish with outcome</text>

  <path d="M180 190 H195" stroke="#94a3b8" stroke-width="3" fill="none"/><polygon points="191,182 207,190 191,198" fill="#94a3b8"/>
  <path d="M340 190 H355" stroke="#94a3b8" stroke-width="3" fill="none"/><polygon points="351,182 367,190 351,198" fill="#94a3b8"/>
  <path d="M500 190 H515" stroke="#94a3b8" stroke-width="3" fill="none"/><polygon points="511,182 527,190 511,198" fill="#94a3b8"/>

  <text x="350" y="360" text-anchor="middle" font-size="13" fill="#0f172a" font-family="Arial, sans-serif">Use short labels and clear hand positions when teaching ${title.toLowerCase()}.</text>
</svg>`.trim()
}

function buildFallbackEducationalContent(
  topic: string,
  chapter: string,
  standard: string,
  subject: string,
): GeneratedContent {
  const displayTitle = normalizeDisplayTitle(topic)
  const contextDescriptor = buildContextDescriptor(standard, subject, chapter)
  const contextSentence = contextDescriptor ? ` It is being taught in ${contextDescriptor}.` : ""
  const explanation = [
    `${displayTitle} is an important concept that helps us understand how things work in the world around us.${contextSentence} Think of it as a process with a clear beginning, middle, and end - just like following a recipe or building something step by step.`,
    `To understand ${displayTitle}, start by looking at what you begin with (the inputs), then see what happens during the main process (the transformation), and finally observe what you end up with (the results). This step-by-step approach makes even complex ideas easier to grasp and shows why this concept matters in everyday life.`,
  ].join("\n\n")

  return {
    explanation,
    imagePrompt: `Educational diagram of ${displayTitle} with short labels, arrows, one main process, clear inputs, and clear outputs.`,
    detailedIllustrationSVG: buildFallbackDetailedIllustrationSVG(displayTitle, contextDescriptor),
    signLanguageSVG: buildFallbackSignLanguageSVG(displayTitle),
    visualTranscript: buildFallbackVisualTranscript(displayTitle),
  }
}

async function runGeminiJsonPrompt<T>(prompt: string, label: string): Promise<T> {
  let lastError: unknown

  console.log(`[${label}] Starting with ${keys.length} API keys`)

  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro", "gemini-2.0-flash-001"]

  for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
    const key = keys[keyIndex]

    for (const modelName of modelsToTry) {
      try {
        console.log(`[${label}] Trying key ${keyIndex + 1}/${keys.length}, model: ${modelName}`)

        const genAI = new GoogleGenerativeAI(key)
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(prompt)
        const responseText = result.response.text()

        try {
          return JSON.parse(responseText) as T
        } catch {
          const jsonMatch =
            responseText.match(/\`\`\`json\n?([\s\S]*?)\n?\`\`\`/) ||
            responseText.match(/({[\s\S]*})/)

          if (!jsonMatch) {
            throw new Error("Could not parse JSON response from model")
          }

          return JSON.parse(jsonMatch[1]) as T
        }
      } catch (error: any) {
        console.warn(
          `[${label}] Key ${keyIndex + 1}/${keys.length} with model ${modelName} failed:`,
          error?.message?.substring(0, 120),
        )
        lastError = error

        if (error?.message?.includes("404") || error?.message?.includes("not found")) {
          continue
        }

        if (error?.message?.includes("429") || error?.message?.includes("quota")) {
          break
        }
      }
    }
  }

  console.error(`[${label}] All Gemini API keys and models failed or exhausted.`)
  throw lastError || new Error(`Failed to generate ${label} with any available API key or model`)
}

export async function generateEducationalContent(
  topic: string,
  chapter: string,
  standard: string,
  subject: string,
): Promise<GeneratedContent> {
  const fallback = buildFallbackEducationalContent(topic, chapter, standard, subject)
  const contextParts = []
  if (standard) contextParts.push(`Standard ${standard}`)
  if (subject) contextParts.push(`Subject: ${subject}`)
  if (chapter) contextParts.push(`Chapter: ${chapter}`)
  const contextStr = contextParts.length > 0 ? ` (${contextParts.join(", ")})` : ""

  if (keys.length === 0) {
    console.warn("[GenerateContent] No GEMINI_API_KEY configured. Using local fallback content.")
    return fallback
  }

  const prompt = `You create visual learning content for deaf and hard-of-hearing students (grades 6-8).
Return ONLY valid JSON. No markdown. No code fences.

Topic: "${topic}"${contextStr}

CRITICAL EXPLANATION REQUIREMENTS:
Your explanation must be:
1. SIMPLE & CLEAR: Use everyday language. Avoid jargon. If you must use technical terms, define them immediately in simple words.
2. VISUAL & CONCRETE: Describe what students can SEE, TOUCH, or EXPERIENCE. Use real-world examples they encounter daily.
3. STEP-BY-STEP: Break complex ideas into small, logical steps. Use "First...", "Then...", "Finally..." structure.
4. RELEVANT: Connect to students' lives. Answer "Why does this matter to ME?" Show practical applications.
5. STRUCTURED: 
   - Paragraph 1: What it is + Simple definition + Real-life example
   - Paragraph 2: How it works step-by-step + Why it matters in daily life

EXPLANATION STYLE GUIDE:
✓ GOOD: "Photosynthesis is how plants make their own food using sunlight. Think of it like a plant's kitchen where sunlight is the energy source. First, the plant's leaves capture sunlight like solar panels. Then, they mix this energy with water from the soil and carbon dioxide from the air. Finally, this creates sugar (food) and releases oxygen that we breathe."

✗ BAD: "Photosynthesis is the biochemical process by which chloroplasts convert light energy into chemical energy through the Calvin cycle and light-dependent reactions."

Requirements:
- explanation: 2 paragraphs (4-6 sentences each). Follow the structure above. Use analogies, comparisons, and real-world examples. Target reading level: grades 6-8.
- imagePrompt: 1 sentence for a conceptual educational diagram with clear labels and arrows showing the process.
- detailedIllustrationSVG: REAL SVG only. Use visible shapes such as <rect>, <circle>, <path>, <line>, <text>, <polygon>. Minimum 600 characters.
- signLanguageSVG: REAL SVG only. Show a topic-specific 3-step or 4-step signing guide in separate columns so labels and hands do not overlap.
- visualTranscript: 4 short timestamped lines for a clean storyboard, for example:
  0:00 - Title and core idea appear
  0:04 - First key step is shown
  0:08 - Second key step is shown
  0:12 - Final takeaway is highlighted

Quality rules:
- Keep labels short and readable.
- Do not overlap text with other text or shapes.
- If the topic is abstract, turn it into a simple cause-and-effect or step-by-step visual sequence.
- detailedIllustrationSVG must use viewBox="0 0 800 500" and include a clear title plus 4-6 labeled visual elements.
- signLanguageSVG must use viewBox="0 0 700 400", include numbered steps, arrows between steps, and a short summary at the bottom.
- Never return empty SVG or text descriptions of SVG.

Return exactly this JSON shape:
{
  "explanation": "Clear, simple, student-friendly explanation of ${topic} with real-world examples and step-by-step breakdown",
  "imagePrompt": "Conceptual educational diagram prompt for ${topic}",
  "detailedIllustrationSVG": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'>...</svg>",
  "signLanguageSVG": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 700 400'>...</svg>",
  "visualTranscript": "0:00 - ...\\n0:04 - ...\\n0:08 - ...\\n0:12 - ..."
}`

  let lastError: unknown

  console.log(`[GenerateContent] Starting with ${keys.length} API keys`)

  // Prefer fast models first to keep VIC responsive.
  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro", "gemini-2.0-flash-001"]

  for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
    const key = keys[keyIndex]

    for (const modelName of modelsToTry) {
      try {
        console.log(`[GenerateContent] Trying key ${keyIndex + 1}/${keys.length}, model: ${modelName}`)

        const genAI = new GoogleGenerativeAI(key)
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(prompt)
        const responseText = result.response.text()

        try {
          const content = JSON.parse(responseText) as GeneratedContent
          console.log(`[GenerateContent] Success with ${modelName} for topic: ${topic}`)
          return content
        } catch {
          const jsonMatch =
            responseText.match(/\`\`\`json\n?([\s\S]*?)\n?\`\`\`/) ||
            responseText.match(/({[\s\S]*})/)

          if (!jsonMatch) {
            throw new Error("Could not parse JSON response from model")
          }

          const content = JSON.parse(jsonMatch[1]) as GeneratedContent
          console.log(`[GenerateContent] Success with regex parse from ${modelName} for topic: ${topic}`)
          return content
        }
      } catch (error: any) {
        console.warn(
          `[GenerateContent] Key ${keyIndex + 1}/${keys.length} with model ${modelName} failed:`,
          error?.message?.substring(0, 120),
        )
        lastError = error

        if (error?.message?.includes("404") || error?.message?.includes("not found")) {
          continue
        }

        if (error?.message?.includes("429") || error?.message?.includes("quota")) {
          break
        }
      }
    }
  }

  console.warn("[GenerateContent] All Gemini API keys and models failed. Using local fallback content.", lastError)
  return fallback
}

const STORYBOARD_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "using",
  "visual",
  "called",
  "which",
  "about",
  "please",
  "show",
  "tell",
  "topic",
  "concept",
  "chapter",
])

function cleanText(value: string): string {
  return value
    .replace(/\r/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s"'`-]+|[\s"'`-]+$/g, "")
    .trim()
}

function truncateText(value: string, max: number): string {
  if (value.length <= max) return value
  const sliced = value.slice(0, max + 1)
  const lastSpace = sliced.lastIndexOf(" ")
  return `${(lastSpace > 12 ? sliced.slice(0, lastSpace) : sliced.slice(0, max)).trim()}...`
}

function uniqueValues(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const cleaned = cleanText(value)
    if (!cleaned) continue
    const normalized = cleaned.toLowerCase()
    if (seen.has(normalized)) continue
    seen.add(normalized)
    result.push(cleaned)
  }

  return result
}

function collapseRepeatedWholePhrase(value: string): string {
  const words = cleanText(value).split(" ").filter(Boolean)
  if (words.length < 2) return cleanText(value)

  for (let chunkSize = Math.floor(words.length / 2); chunkSize >= 1; chunkSize--) {
    if (words.length % chunkSize !== 0) continue

    const firstChunk = words.slice(0, chunkSize).join(" ").toLowerCase()
    let repeated = true

    for (let index = chunkSize; index < words.length; index += chunkSize) {
      const nextChunk = words.slice(index, index + chunkSize).join(" ").toLowerCase()
      if (nextChunk !== firstChunk) {
        repeated = false
        break
      }
    }

    if (repeated) {
      return words.slice(0, chunkSize).join(" ")
    }
  }

  return words.join(" ")
}

function collapseAdjacentDuplicateWords(value: string): string {
  const words = cleanText(value).split(" ").filter(Boolean)
  const result: string[] = []

  for (const word of words) {
    if (result.length > 0 && result[result.length - 1].toLowerCase() === word.toLowerCase()) {
      continue
    }

    result.push(word)
  }

  return result.join(" ")
}

function toTitleCase(value: string): string {
  return cleanText(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (/^[A-Z0-9+-]{2,}$/.test(word)) return word
      if (/\d/.test(word)) return word.toUpperCase()
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(" ")
}

function splitSentences(value: string): string[] {
  return value
    .split(/(?<=[.!?])\s+|\n+/)
    .map((item) => cleanText(item.replace(/^\d+:\d+\s*-\s*/g, "")))
    .filter((item) => item.length > 12)
}

function firstMeaningfulSentence(value: string): string {
  return splitSentences(value)[0] || ""
}

function normalizeDisplayTitle(value: string): string {
  const withoutNoise = cleanText(value)
    .replace(/[^\p{L}\p{N}\s/&+-]/gu, " ")
    .replace(/\b(um+|uh+|like|bro|listen|mistakely|mistakenly|exactly)\b/gi, " ")

  const deduped = collapseAdjacentDuplicateWords(collapseRepeatedWholePhrase(withoutNoise))
  const cleaned = cleanText(deduped)
  const words = cleaned.split(/\s+/).filter(Boolean).slice(0, 5)

  if (words.length === 0) {
    return "Concept Overview"
  }

  return toTitleCase(words.join(" "))
}

function buildStepTitle(detail: string, fallback: string): string {
  const words = cleanText(detail)
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STORYBOARD_STOP_WORDS.has(word.toLowerCase()))
    .slice(0, 4)

  if (words.length === 0) return fallback
  return toTitleCase(words.join(" "))
}

function extractKeyTerms(source: string): string[] {
  const counts = new Map<string, number>()

  for (const word of cleanText(source)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)) {
    if (word.length < 4 || STORYBOARD_STOP_WORDS.has(word)) continue
    counts.set(word, (counts.get(word) || 0) + 1)
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 3)
    .map(([word]) => toTitleCase(word))
}

function buildFallbackAnimationStoryboard(
  topic: string,
  explanation: string,
  visualTranscript: string,
): AnimationStoryboard {
  const displayTitle = normalizeDisplayTitle(topic)
  const subtitle = truncateText(
    cleanText(firstMeaningfulSentence(explanation) || `${displayTitle} explained in four simple visual steps.`),
    88,
  )

  const transcriptItems = visualTranscript
    .split(/\n+/)
    .map((line) => cleanText(line.replace(/^\d+:\d+\s*-\s*/g, "")))
    .filter((line) => line.length > 10)

  const explanationItems = splitSentences(explanation)
  const detailPool = uniqueValues([
    ...transcriptItems,
    ...explanationItems,
    `${displayTitle} starts with the main input or starting idea.`,
    `The next important part of ${displayTitle} is introduced clearly.`,
    `${displayTitle} shows the main change or action in the center.`,
    `The final result of ${displayTitle} becomes clear for students.`,
  ])

  const steps = Array.from({ length: 4 }, (_, index) => {
    const detail = truncateText(
      cleanText(detailPool[index] || `${displayTitle} is explained visually in step ${index + 1}.`),
      82,
    )

    return {
      title: truncateText(buildStepTitle(detail, `Step ${index + 1}`), 24),
      detail,
    }
  })

  const keyTerms = uniqueValues([
    ...extractKeyTerms(`${displayTitle} ${subtitle} ${explanation}`),
    displayTitle,
  ]).slice(0, 3)

  return {
    displayTitle,
    subtitle,
    steps,
    keyTerms,
    flow: truncateText(steps.map((step) => step.title).join(" -> "), 78),
  }
}

function normalizeStoryboardResult(
  candidate: Partial<AnimationStoryboard> | null | undefined,
  fallback: AnimationStoryboard,
): AnimationStoryboard {
  const displayTitle = normalizeDisplayTitle(candidate?.displayTitle || fallback.displayTitle)
  const subtitle = truncateText(
    cleanText(candidate?.subtitle || fallback.subtitle || `${displayTitle} explained visually.`),
    88,
  )

  const rawSteps = Array.isArray(candidate?.steps) ? candidate.steps : []
  const steps = Array.from({ length: 4 }, (_, index) => {
    const fallbackStep = fallback.steps[index]
    const rawStep = rawSteps[index]
    const detail = truncateText(
      cleanText(rawStep?.detail || fallbackStep?.detail || `${displayTitle} is shown in step ${index + 1}.`),
      82,
    )
    const title = truncateText(
      normalizeDisplayTitle(rawStep?.title || buildStepTitle(detail, fallbackStep?.title || `Step ${index + 1}`)),
      24,
    )

    return {
      title: title || fallbackStep.title,
      detail: detail || fallbackStep.detail,
    }
  })

  const keyTerms = uniqueValues([
    ...((candidate?.keyTerms || []).map((term) => normalizeDisplayTitle(term))),
    ...fallback.keyTerms,
    ...extractKeyTerms(`${displayTitle} ${subtitle} ${steps.map((step) => step.title).join(" ")}`),
  ]).slice(0, 3)

  const flow = truncateText(
    cleanText(candidate?.flow || fallback.flow || steps.map((step) => step.title).join(" -> ")),
    78,
  )

  return {
    displayTitle,
    subtitle,
    steps,
    keyTerms,
    flow,
  }
}

export async function generateAnimationStoryboard(
  topic: string,
  chapter: string,
  standard: string,
  subject: string,
  explanation: string,
  visualTranscript: string,
): Promise<AnimationStoryboard> {
  const contextParts = []
  if (standard) contextParts.push(`Standard ${standard}`)
  if (subject) contextParts.push(`Subject: ${subject}`)
  if (chapter) contextParts.push(`Chapter: ${chapter}`)
  const contextStr = contextParts.length > 0 ? contextParts.join(", ") : "No extra context"
  const fallback = buildFallbackAnimationStoryboard(topic, explanation, visualTranscript)

  if (keys.length === 0) {
    console.warn("[AnimationStoryboard] No GEMINI_API_KEY configured. Using local storyboard fallback.")
    return fallback
  }

  const prompt = `You clean raw classroom speech into a visual storyboard for a 15 second educational animation.
Return ONLY valid JSON. No markdown. No code fences.

Raw spoken topic: "${topic}"
Context: ${contextStr}
Explanation:
${explanation}

Existing transcript cues:
${visualTranscript || "(none)"}

Rules:
- Infer the intended classroom concept even if the raw topic has repeated words, filler words, or small speech mistakes.
- displayTitle: 2 to 5 words, clean classroom title, never repeat the same word or phrase.
- subtitle: 1 short sentence, maximum 14 words.
- steps: exactly 4 items in logical order from start to process to result.
- Each step title: 1 to 4 words, concrete, not vague.
- Each step detail: 1 short sentence, maximum 12 words.
- keyTerms: exactly 3 short terms.
- flow: one short process chain using arrows, maximum 7 segments.
- Avoid generic titles like "Called", "Using", "Visual", "Main Result", "Why It Matters".
- Do not copy the raw speech as-is when it is messy or repetitive.

Return exactly this JSON shape:
{
  "displayTitle": "Clean topic title",
  "subtitle": "Short classroom subtitle",
  "steps": [
    { "title": "Step 1", "detail": "Short detail" },
    { "title": "Step 2", "detail": "Short detail" },
    { "title": "Step 3", "detail": "Short detail" },
    { "title": "Step 4", "detail": "Short detail" }
  ],
  "keyTerms": ["term 1", "term 2", "term 3"],
  "flow": "A -> B -> C"
}`

  try {
    const candidate = await runGeminiJsonPrompt<Partial<AnimationStoryboard>>(prompt, "AnimationStoryboard")
    return normalizeStoryboardResult(candidate, fallback)
  } catch (error) {
    console.warn("[AnimationStoryboard] Falling back to local storyboard:", error)
    return fallback
  }
}
