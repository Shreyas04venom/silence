interface AnimationBuildInput {
  topic: string
  chapter?: string
  standard?: string
  subject?: string
  explanation: string
  displayTitle?: string
  subtitle?: string
  heroImageUrl?: string | null
  stepCards?: Array<{ title: string; detail: string }>
  flowText?: string | null
  keyTerms?: string[] | null
  illustrationSVG?: string | null
  visualTranscript?: string | null
}

interface Scene {
  stamp: string
  title: string
  detail: string
}

interface CardData {
  title: string
  subtitle: string
}

interface Theme {
  accent: string
  accentSoft: string
  accentWarm: string
  accentCool: string
  accentSuccess: string
  backgroundStart: string
  backgroundEnd: string
  grid: string
  surface: string
  border: string
}

const STOP_WORDS = new Set([
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
  "its",
  "of",
  "on",
  "or",
  "that",
  "the",
  "their",
  "this",
  "to",
  "with",
])

function clean(value: string): string {
  return value
    .replace(/\r/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s"'`-]+|[\s"'`-]+$/g, "")
    .trim()
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value
  const sliced = value.slice(0, max + 1)
  const lastSpace = sliced.lastIndexOf(" ")
  return `${(lastSpace > 16 ? sliced.slice(0, lastSpace) : sliced.slice(0, max)).trim()}...`
}

function toSentences(value: string): string[] {
  return value
    .split(/(?<=[.!?])\s+|\n+/)
    .map((item) => clean(item))
    .filter((item) => item.length > 24)
}

function parseTranscript(value?: string | null): Array<{ stamp: string; detail: string }> {
  if (!value) return []

  return value
    .split(/\n+/)
    .map((line) => clean(line))
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+:\d+)\s*-\s*(.+)$/)
      return match ? { stamp: match[1], detail: clean(match[2]) } : { stamp: "", detail: line }
    })
    .filter((item) => item.detail.length > 10)
}

function unique(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const normalized = value.toLowerCase()
    if (seen.has(normalized)) continue
    seen.add(normalized)
    result.push(value)
  }

  return result
}

function toLabel(value: string, max = 18): string {
  const collapsed = truncate(clean(value), max)
  return collapsed.toUpperCase()
}

function toSubtitle(value: string, max = 38): string {
  return truncate(clean(value), max)
}

function buildSceneTitle(detail: string, fallback: string): string {
  const normalizedDetail = clean(detail)
    .replace(/^why it matters[:\s-]*/i, "")
    .replace(/^title and core idea(?: appear| appears)?[:\s-]*/i, "")
    .replace(/^first key step(?: is shown)?[:\s-]*/i, "")
    .replace(/^second key step(?: is shown)?[:\s-]*/i, "")
    .replace(/^final takeaway(?: is highlighted)?[:\s-]*/i, "")

  const words = normalizedDetail
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 2 &&
        !STOP_WORDS.has(word.toLowerCase()) &&
        !["called", "using", "which", "where", "there", "their", "title", "visual"].includes(word.toLowerCase()),
    )

  const source = (words.length >= 2 ? words : normalizedDetail.split(/\s+/)).slice(0, 3).join(" ")
  if (!source) return fallback
  return truncate(source.replace(/\b([a-z])/g, (letter) => letter.toUpperCase()), 22)
}

function buildScenes(input: AnimationBuildInput): Scene[] {
  const providedSteps = (input.stepCards || [])
    .map((step) => ({
      title: truncate(clean(step?.title || ""), 24),
      detail: truncate(clean(step?.detail || ""), 92),
    }))
    .filter((step) => step.title || step.detail)

  if (providedSteps.length > 0) {
    return Array.from({ length: 4 }, (_, index) => {
      const step = providedSteps[index]
      const fallbackDetail =
        step?.detail ||
        `${input.displayTitle || input.topic} is explained clearly in step ${index + 1}.`

      return {
        stamp: `0:${String(index * 4).padStart(2, "0")}`,
        title: step?.title || buildSceneTitle(fallbackDetail, `Step ${index + 1}`),
        detail: fallbackDetail,
      }
    })
  }

  const transcript = parseTranscript(input.visualTranscript)
  const explanationLines = toSentences(input.explanation)
  const fallback = [
    `${input.topic} begins with the core idea becoming visible in the center of the lesson.`,
    `Important parts of ${input.topic} move into the main concept area one by one.`,
    `The main process of ${input.topic} is shown through motion, flow, and highlighted change.`,
    `The final outcome and key takeaway of ${input.topic} are revealed clearly.`,
  ]

  const detailPool = unique([...transcript.map((item) => item.detail), ...explanationLines, ...fallback])

  return Array.from({ length: 4 }, (_, index) => {
    const detail = detailPool[index] || fallback[index]
    return {
      stamp: transcript[index]?.stamp || `0:${String(index * 4).padStart(2, "0")}`,
      title: buildSceneTitle(detail, `Stage ${index + 1}`),
      detail: truncate(detail, 110),
    }
  })
}

function buildKeywords(input: AnimationBuildInput): string[] {
  const storyboardTerms = unique(
    (input.keyTerms || [])
      .map((value) => clean(value || ""))
      .filter(Boolean),
  )

  const seeded = unique(
    [input.topic, input.chapter, input.subject, input.standard ? `Standard ${input.standard}` : ""]
      .map((value) => clean(value || ""))
      .filter(Boolean),
  )

  const counts = new Map<string, number>()
  const source = `${input.topic} ${input.chapter || ""} ${input.explanation}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")

  for (const word of source.split(/\s+/)) {
    if (word.length < 4 || STOP_WORDS.has(word)) continue
    counts.set(word, (counts.get(word) || 0) + 1)
  }

  const derived = [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([word]) => word.replace(/\b([a-z])/g, (letter) => letter.toUpperCase()))

  return unique([...storyboardTerms, ...seeded, ...derived]).slice(0, 8)
}

function buildContext(input: AnimationBuildInput): string {
  return [input.standard ? `Standard ${input.standard}` : "", input.subject || "", input.chapter || ""]
    .map((value) => clean(value))
    .filter(Boolean)
    .join(" | ")
}

function resolveTheme(subject?: string): Theme {
  const normalized = (subject || "").toLowerCase()

  if (normalized.includes("math")) {
    return {
      accent: "#8b5cf6",
      accentSoft: "#ddd6fe",
      accentWarm: "#f59e0b",
      accentCool: "#60a5fa",
      accentSuccess: "#34d399",
      backgroundStart: "#12061f",
      backgroundEnd: "#05010b",
      grid: "rgba(221, 214, 254, 0.06)",
      surface: "rgba(255,255,255,0.06)",
      border: "rgba(255,255,255,0.14)",
    }
  }

  if (normalized.includes("science")) {
    return {
      accent: "#a3e635",
      accentSoft: "#d9f99d",
      accentWarm: "#facc15",
      accentCool: "#38bdf8",
      accentSuccess: "#4ade80",
      backgroundStart: "#031608",
      backgroundEnd: "#010607",
      grid: "rgba(163, 230, 53, 0.06)",
      surface: "rgba(255,255,255,0.06)",
      border: "rgba(255,255,255,0.14)",
    }
  }

  return {
    accent: "#22d3ee",
    accentSoft: "#a5f3fc",
    accentWarm: "#fbbf24",
    accentCool: "#60a5fa",
    accentSuccess: "#34d399",
    backgroundStart: "#051320",
    backgroundEnd: "#02070d",
    grid: "rgba(34, 211, 238, 0.06)",
    surface: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.14)",
  }
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c")
}

function normalizeIllustrationSvg(value?: string | null): string | null {
  if (!value) return null

  const cleaned = value
    .replace(/```(?:svg|xml)?/gi, "")
    .replace(/```/g, "")
    .trim()

  return /<svg[\s>]/i.test(cleaned) ? cleaned : null
}

function buildHeroIllustrationSvg(value?: string | null): string | null {
  const normalized = normalizeIllustrationSvg(value)
  if (!normalized) return null

  const viewBoxMatch = normalized.match(/viewBox=["']([-\d.\s]+)["']/i)
  const numbers = viewBoxMatch?.[1]
    ?.trim()
    .split(/\s+/)
    .map((part) => Number(part))

  const [x, y, width, height] =
    numbers && numbers.length === 4 && numbers.every((part) => Number.isFinite(part))
      ? numbers
      : [0, 0, 800, 500]

  const cropX = x + width * 0.2
  const cropY = y + height * 0.14
  const cropWidth = width * 0.6
  const cropHeight = height * 0.7

  const inner = normalized
    .replace(/<text\b[\s\S]*?<\/text>/gi, "")
    .replace(/<foreignObject\b[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/<title\b[\s\S]*?<\/title>/gi, "")
    .replace(/<desc\b[\s\S]*?<\/desc>/gi, "")
    .replace(/^.*?<svg[^>]*>/is, "")
    .replace(/<\/svg>\s*$/i, "")

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${cropX} ${cropY} ${cropWidth} ${cropHeight}">${inner}</svg>`
}

export function buildAnimationSrcDoc(animationCode: string): string {
  const trimmed = animationCode.trim()
  if (/<html[\s>]|<!doctype html/i.test(trimmed)) return trimmed

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#030712}body{font-family:Arial,sans-serif}</style></head><body>${trimmed}</body></html>`
}

function buildCards(topic: string, scenes: Scene[], takeaways: string[], displayTitle?: string, subtitle?: string) {
  const card = (title: string, subtitle: string): CardData => ({
    title: truncate(clean(title), 22),
    subtitle: toSubtitle(subtitle, 56),
  })

  return {
    inputA: card(scenes[0]?.title || "Step One", scenes[0]?.detail || `${topic} starts here.`),
    inputB: card(scenes[1]?.title || "Step Two", scenes[1]?.detail || `${topic} adds the next idea.`),
    focus: card(displayTitle || topic, subtitle || scenes[0]?.detail || `${topic} is the main concept.`),
    process: card(scenes[2]?.title || "Step Three", scenes[2]?.detail || `${topic} transforms through the main process.`),
    result: card(scenes[3]?.title || "Step Four", scenes[3]?.detail || `${topic} ends with a clear result.`),
    takeaway: card("Summary", takeaways[0] || scenes[3]?.detail || `${topic} has a clear takeaway.`),
  }
}

function buildFormula(scenes: Scene[], topic: string, flowText?: string | null): string {
  if (flowText && clean(flowText)) {
    return truncate(clean(flowText), 84)
  }

  const flow = unique(scenes.map((scene) => truncate(scene.title, 16)).filter(Boolean)).slice(0, 3)
  if (flow.length < 2) {
    return `${clean(topic)} -> key result`
  }

  return flow.join(" -> ")
}

export function buildStructuredEducationalAnimation(input: AnimationBuildInput): string {
  const theme = resolveTheme(input.subject)
  const scenes = buildScenes(input)
  const keywords = buildKeywords(input)
  const takeaways = unique([...toSentences(input.explanation), ...scenes.map((scene) => scene.detail)]).slice(0, 4)
  const displayTitle = clean(input.displayTitle || input.topic)
  const subtitle = clean(input.subtitle || "")
  const cards = buildCards(input.topic, scenes, takeaways, displayTitle, subtitle)
  const payload = safeJson({
    topic: displayTitle,
    context: subtitle || buildContext(input) || "Visual concept animation",
    formula: buildFormula(scenes, displayTitle || input.topic, input.flowText),
    takeaway: toSubtitle(subtitle || takeaways[0] || scenes[3].detail, 72),
    captionSteps: scenes,
    keywords: (input.keyTerms?.length ? input.keyTerms : scenes.slice(0, 3).map((scene) => scene.title)).map((item) =>
      truncate(clean(item), 16),
    ),
    heroImageUrl: clean(input.heroImageUrl || ""),
    illustrationSvg: buildHeroIllustrationSvg(input.illustrationSVG),
    cards,
    theme,
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${displayTitle} Visual Animation</title>
  <style>
    :root{
      --accent:${theme.accent};
      --accent-soft:${theme.accentSoft};
      --accent-warm:${theme.accentWarm};
      --accent-cool:${theme.accentCool};
      --accent-success:${theme.accentSuccess};
      --background-start:${theme.backgroundStart};
      --background-end:${theme.backgroundEnd};
      --grid:${theme.grid};
      --surface:${theme.surface};
      --border:${theme.border};
      --text:#f8fafc;
      --muted:rgba(226,232,240,0.78);
      --shadow:0 24px 60px rgba(0,0,0,0.42);
    }

    *{box-sizing:border-box}
    html,body{margin:0;width:100%;height:100%;overflow:hidden;font-family:Arial,sans-serif;background:radial-gradient(circle at top left,rgba(255,255,255,0.04),transparent 28%),linear-gradient(135deg,var(--background-start),var(--background-end));color:var(--text)}
    body{display:flex;align-items:center;justify-content:center;padding:14px}
    .frame{
      position:relative;
      width:min(100%, 980px);
      aspect-ratio:900 / 680;
      border-radius:28px;
      overflow:hidden;
      border:1px solid rgba(255,255,255,0.08);
      background:radial-gradient(circle at center top,rgba(255,255,255,0.03),transparent 30%),linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.22));
      box-shadow:var(--shadow);
    }
    .frame::before{
      content:"";
      position:absolute;
      inset:5.5%;
      border-radius:22px;
      background:
        linear-gradient(var(--grid) 1px, transparent 1px),
        linear-gradient(90deg, var(--grid) 1px, transparent 1px),
        radial-gradient(circle at center, rgba(255,255,255,0.03), transparent 50%);
      background-size:40px 40px, 40px 40px, auto;
      box-shadow:inset 0 0 40px rgba(0,0,0,0.32);
    }
    canvas{
      position:absolute;
      inset:5.5%;
      width:89%;
      height:89%;
      border-radius:22px;
    }
    .overlay{
      position:absolute;
      inset:5.5%;
      border-radius:22px;
      pointer-events:none;
    }
    .title{
      position:absolute;
      top:2.4%;
      left:50%;
      transform:translateX(-50%);
      text-align:center;
      width:min(70%, 620px);
      z-index:4;
    }
    .title h1{
      margin:0;
      font-size:clamp(28px,4vw,50px);
      letter-spacing:-0.05em;
      font-weight:800;
      color:var(--accent-warm);
      text-transform:uppercase;
      text-shadow:0 0 26px rgba(250,204,21,0.18);
    }
    .title p{
      margin:8px 0 0;
      font-size:14px;
      color:var(--accent-soft);
      line-height:1.4;
    }
    .reactor{
      position:absolute;
      inset:16% 30% 18% 29%;
      display:flex;
      align-items:center;
      justify-content:center;
      z-index:3;
    }
    .hero-glow{
      position:absolute;
      inset:9%;
      border-radius:999px;
      background:radial-gradient(circle,var(--accent-success),transparent 68%);
      filter:blur(22px);
      opacity:0.88;
      animation:breathe 4.8s ease-in-out infinite;
    }
    .hero-shell{
      position:relative;
      width:78%;
      height:78%;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:6%;
      border-radius:32px;
      overflow:hidden;
      border:1px solid rgba(255,255,255,0.12);
      background:
        radial-gradient(circle at 35% 30%,rgba(255,255,255,0.22),transparent 18%),
        linear-gradient(180deg,rgba(255,255,255,0.06),rgba(5,10,7,0.72)),
        radial-gradient(circle,var(--accent-success),rgba(22,101,52,0.92) 72%);
      box-shadow:0 0 40px rgba(74,222,128,0.24), inset 0 0 32px rgba(255,255,255,0.05);
      animation:breathe 4.2s ease-in-out infinite;
    }
    .hero-shell::before{
      content:"";
      position:absolute;
      inset:0;
      background:linear-gradient(180deg,rgba(255,255,255,0.08),transparent 34%);
      pointer-events:none;
    }
    .hero-art{
      width:100%;
      height:100%;
      object-fit:contain;
      object-position:center center;
      filter:drop-shadow(0 18px 26px rgba(0,0,0,0.28));
    }
    .hero-fallback{
      position:absolute;
      inset:0;
      border-radius:inherit;
      background:radial-gradient(circle at 35% 30%,rgba(255,255,255,0.22),transparent 18%),radial-gradient(circle,var(--accent-success),rgba(22,101,52,0.92) 72%);
    }
    .hero-orbit{
      position:absolute;
      width:12px;
      height:12px;
      border-radius:999px;
      background:var(--accent-warm);
      box-shadow:0 0 16px currentColor;
      color:var(--accent-warm);
      animation:blink 2.4s ease-in-out infinite;
    }
    .hero-orbit.one{left:30%;top:18%}
    .hero-orbit.two{left:25%;top:36%;animation-delay:-0.5s}
    .hero-orbit.three{right:28%;top:34%;animation-delay:-1.1s}
    .hero-orbit.four{right:18%;bottom:32%;animation-delay:-1.7s}
    .hero-orbit.five{left:38%;bottom:22%;animation-delay:-2.1s}
    .hero-orbit.six{left:56%;top:22%;animation-delay:-2.6s}
    .conduit{
      position:absolute;
      left:49%;
      bottom:9%;
      width:22px;
      height:30%;
      transform:translateX(-50%);
      border-radius:18px 18px 10px 10px;
      background:linear-gradient(180deg,rgba(125,211,252,0.2),rgba(120,53,15,0.65) 22%,rgba(120,53,15,0.78) 100%);
      box-shadow:0 0 18px rgba(56,189,248,0.18);
      z-index:2;
    }
    .conduit::before{
      content:"";
      position:absolute;
      inset:8% 38%;
      border-radius:999px;
      background:linear-gradient(180deg,rgba(56,189,248,0.9),rgba(56,189,248,0.12));
      opacity:0.86;
      animation:rise 2.8s linear infinite;
    }
    .roots{
      position:absolute;
      left:49%;
      bottom:6.3%;
      width:120px;
      height:42px;
      transform:translateX(-50%);
      z-index:2;
    }
    .roots span{
      position:absolute;
      display:block;
      height:4px;
      border-radius:999px;
      background:rgba(250,204,21,0.22);
      transform-origin:left center;
    }
    .roots span:nth-child(1){width:56px;left:50%;top:8px;transform:rotate(18deg)}
    .roots span:nth-child(2){width:52px;left:8px;top:14px;transform:rotate(-16deg)}
    .roots span:nth-child(3){width:40px;left:66px;top:26px;transform:rotate(40deg)}
    .roots span:nth-child(4){width:38px;left:26px;top:30px;transform:rotate(-38deg)}
    .panel,.formula,.caption{
      position:absolute;
      border-radius:16px;
      border:1px solid var(--border);
      background:linear-gradient(180deg,rgba(12,18,15,0.9),rgba(6,10,8,0.92));
      box-shadow:0 0 0 1px rgba(255,255,255,0.03),0 0 26px rgba(0,0,0,0.22);
      padding:12px 16px;
      z-index:4;
    }
    .panel{
      width:170px;
      min-height:74px;
      transition:transform .28s ease, opacity .28s ease, box-shadow .28s ease, border-color .28s ease;
      opacity:0.72;
    }
    .panel.active{
      transform:translateY(-2px) scale(1.02);
      opacity:1;
    }
    .panel .label{
      font-size:11px;
      letter-spacing:0.08em;
      color:var(--muted);
      text-transform:uppercase;
    }
    .panel h3{
      margin:2px 0 6px;
      font-size:16px;
      line-height:1.05;
      font-weight:800;
      display:-webkit-box;
      -webkit-box-orient:vertical;
      -webkit-line-clamp:2;
      overflow:hidden;
    }
    .panel p{
      margin:0;
      font-size:12px;
      line-height:1.35;
      color:var(--accent-soft);
      display:-webkit-box;
      -webkit-box-orient:vertical;
      -webkit-line-clamp:3;
      overflow:hidden;
      min-height:48px;
    }
    .panel.input-a{left:6.5%;top:26%;border-color:rgba(226,232,240,0.42);box-shadow:0 0 22px rgba(226,232,240,0.12)}
    .panel.input-b{left:6.5%;top:39%;border-color:rgba(56,189,248,0.56);box-shadow:0 0 22px rgba(56,189,248,0.18)}
    .panel.focus{right:10.5%;top:14%;border-color:rgba(250,204,21,0.68);box-shadow:0 0 22px rgba(250,204,21,0.22)}
    .panel.process{right:11.5%;top:40.5%;border-color:rgba(74,222,128,0.62);box-shadow:0 0 22px rgba(74,222,128,0.18)}
    .panel.result{right:11.5%;top:56%;border-color:rgba(250,204,21,0.62);box-shadow:0 0 22px rgba(250,204,21,0.18)}
    .panel.takeaway{display:none}
    .panel.focus h3,.panel.result h3{color:var(--accent-warm)}
    .panel.input-b h3{color:var(--accent-cool)}
    .panel.process h3{color:var(--accent-success)}
    .panel.input-a h3,.panel.takeaway h3{color:#f8fafc}
    .formula{
      right:5.5%;
      bottom:4.8%;
      width:300px;
      border-radius:18px;
      border-color:rgba(74,222,128,0.54);
      box-shadow:0 0 24px rgba(74,222,128,0.18);
      padding:16px 18px;
    }
    .formula .eyebrow{
      font-size:13px;
      font-weight:800;
      color:#f8fafc;
      text-transform:uppercase;
      letter-spacing:0.04em;
    }
    .formula .chain{
      margin-top:8px;
      font-size:20px;
      line-height:1.2;
      font-weight:800;
      color:var(--accent-soft);
    }
    .formula .note{
      margin-top:8px;
      font-size:12px;
      line-height:1.4;
      color:rgba(226,232,240,0.86);
    }
    .caption{
      left:5.5%;
      bottom:4.8%;
      width:320px;
      min-height:86px;
      border-color:rgba(255,255,255,0.1);
      padding:14px 16px;
    }
    .caption .step{
      font-size:12px;
      font-weight:800;
      color:var(--accent-soft);
      letter-spacing:0.06em;
      text-transform:uppercase;
    }
    .caption p{
      margin:8px 0 0;
      font-size:13px;
      line-height:1.45;
      color:rgba(226,232,240,0.9);
      display:-webkit-box;
      -webkit-box-orient:vertical;
      -webkit-line-clamp:3;
      overflow:hidden;
    }
    .keyword-strip{display:none}
    .chip{
      padding:7px 10px;
      border-radius:999px;
      border:1px solid rgba(255,255,255,0.12);
      background:rgba(255,255,255,0.06);
      font-size:11px;
      font-weight:700;
      color:rgba(226,232,240,0.9);
      letter-spacing:0.04em;
      text-transform:uppercase;
      backdrop-filter:blur(8px);
    }
    @keyframes breathe{
      0%,100%{transform:scale(1);opacity:.92}
      50%{transform:scale(1.06);opacity:1}
    }
    @keyframes blink{
      0%,100%{transform:scale(1);opacity:.45}
      50%{transform:scale(1.8);opacity:1}
    }
    @keyframes rise{
      0%{transform:translateY(62%)}
      100%{transform:translateY(-30%)}
    }
    @media (max-width:860px){
      .panel{width:150px}
      .formula,.caption{width:250px}
    }
  </style>
</head>
<body>
  <div class="frame">
    <canvas id="fx"></canvas>
    <div class="overlay" id="stage">
      <div class="title">
        <h1 id="topic"></h1>
        <p id="context"></p>
      </div>

      <div class="reactor" id="core" data-anchor="core">
        <div class="hero-glow"></div>
        <div class="hero-shell">
          <img id="hero-art" class="hero-art" alt="" />
          <div id="hero-fallback" class="hero-fallback"></div>
        </div>
        <div class="hero-orbit one"></div>
        <div class="hero-orbit two"></div>
        <div class="hero-orbit three"></div>
        <div class="hero-orbit four"></div>
        <div class="hero-orbit five"></div>
        <div class="hero-orbit six"></div>
      </div>

      <div class="conduit"></div>
      <div class="roots"><span></span><span></span><span></span><span></span></div>

      <div class="panel input-a" id="input-a" data-anchor="input-a" data-flow-card="input-a">
        <div class="label">Step 1</div>
        <h3 id="input-a-title"></h3>
        <p id="input-a-subtitle"></p>
      </div>

      <div class="panel input-b" id="input-b" data-anchor="input-b" data-flow-card="input-b">
        <div class="label">Step 2</div>
        <h3 id="input-b-title"></h3>
        <p id="input-b-subtitle"></p>
      </div>

      <div class="panel focus" id="focus" data-anchor="focus" data-flow-card="focus">
        <div class="label">Main idea</div>
        <h3 id="focus-title"></h3>
        <p id="focus-subtitle"></p>
      </div>

      <div class="panel process" id="process" data-anchor="process" data-flow-card="process">
        <div class="label">Step 3</div>
        <h3 id="process-title"></h3>
        <p id="process-subtitle"></p>
      </div>

      <div class="panel result" id="result" data-anchor="result" data-flow-card="result">
        <div class="label">Step 4</div>
        <h3 id="result-title"></h3>
        <p id="result-subtitle"></p>
      </div>

      <div class="panel takeaway" id="takeaway" data-anchor="takeaway" data-flow-card="takeaway">
        <div class="label">Takeaway</div>
        <h3 id="takeaway-title"></h3>
        <p id="takeaway-subtitle"></p>
      </div>

      <div class="formula" id="formula" data-anchor="formula" data-flow-card="formula">
        <div class="eyebrow" id="formula-label"></div>
        <div class="chain" id="formula-chain"></div>
        <div class="note" id="formula-note"></div>
      </div>

      <div class="caption">
        <div class="step" id="caption-step"></div>
        <p id="caption-text"></p>
      </div>

      <div class="keyword-strip" id="keyword-strip"></div>
    </div>
  </div>

  <script>
    const data = ${payload};
    const stage = document.getElementById("stage");
    const canvas = document.getElementById("fx");
    const ctx = canvas.getContext("2d");
    const captionStep = document.getElementById("caption-step");
    const captionText = document.getElementById("caption-text");
    const formulaLabel = document.getElementById("formula-label");
    const formulaChain = document.getElementById("formula-chain");
    const formulaNote = document.getElementById("formula-note");
    const keywordStrip = document.getElementById("keyword-strip");
    const heroArt = document.getElementById("hero-art");
    const heroFallback = document.getElementById("hero-fallback");
    const animatedCards = Array.from(document.querySelectorAll("[data-flow-card]"));

    document.getElementById("topic").textContent = data.topic;
    document.getElementById("context").textContent = data.context;
    document.getElementById("input-a-title").textContent = data.cards.inputA.title;
    document.getElementById("input-a-subtitle").textContent = data.cards.inputA.subtitle;
    document.getElementById("input-b-title").textContent = data.cards.inputB.title;
    document.getElementById("input-b-subtitle").textContent = data.cards.inputB.subtitle;
    document.getElementById("focus-title").textContent = data.cards.focus.title;
    document.getElementById("focus-subtitle").textContent = data.cards.focus.subtitle;
    document.getElementById("process-title").textContent = data.cards.process.title;
    document.getElementById("process-subtitle").textContent = data.cards.process.subtitle;
    document.getElementById("result-title").textContent = data.cards.result.title;
    document.getElementById("result-subtitle").textContent = data.cards.result.subtitle;
    document.getElementById("takeaway-title").textContent = data.cards.takeaway.title;
    document.getElementById("takeaway-subtitle").textContent = data.cards.takeaway.subtitle;
    formulaLabel.textContent = "STEP FLOW";
    formulaChain.textContent = data.formula.toUpperCase();
    formulaNote.textContent = data.takeaway;

    function showFallbackHero() {
      heroArt.style.display = "none";
      heroFallback.style.display = "block";
    }

    function showSvgHero() {
      if (!data.illustrationSvg) {
        showFallbackHero();
        return;
      }

      heroArt.onerror = showFallbackHero;
      heroArt.src = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(data.illustrationSvg);
      heroArt.style.display = "block";
      heroFallback.style.display = "none";
    }

    if (data.heroImageUrl) {
      heroArt.onload = function () {
        heroArt.style.display = "block";
        heroFallback.style.display = "none";
      };
      heroArt.onerror = showSvgHero;
      heroArt.src = data.heroImageUrl;
    } else if (data.illustrationSvg) {
      showSvgHero();
    } else {
      showFallbackHero();
    }

    data.keywords.forEach((keyword) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = keyword.toUpperCase();
      keywordStrip.appendChild(chip);
    });

    const curves = [
      { from: "input-a", to: "core", color: data.theme.accentSoft, width: 2.2, bend: 0.26, particles: 10, speed: 0.16 },
      { from: "input-b", to: "core", color: data.theme.accentCool, width: 2.8, bend: -0.18, particles: 12, speed: 0.18 },
      { from: "focus", to: "core", color: data.theme.accentWarm, width: 3.1, bend: 0.22, particles: 12, speed: 0.14 },
      { from: "core", to: "process", color: data.theme.accentSuccess, width: 2.6, bend: 0.14, particles: 10, speed: 0.17 },
      { from: "core", to: "result", color: data.theme.accentWarm, width: 2.5, bend: 0.18, particles: 8, speed: 0.15 }
    ];

    const phaseMap = [
      { step: 0, cards: ["input-a", "focus"] },
      { step: 1, cards: ["input-b"] },
      { step: 2, cards: ["process"] },
      { step: 3, cards: ["result", "formula"] }
    ];

    let activePhase = 0;
    let lastPhaseShift = 0;

    function setPhase(index) {
      activePhase = index % phaseMap.length;
      const phase = phaseMap[activePhase];
      const scene = data.captionSteps[phase.step] || data.captionSteps[0];

      captionStep.textContent = scene.stamp + "  " + scene.title.toUpperCase();
      captionText.textContent = scene.detail;

      animatedCards.forEach((card) => {
        const id = card.getAttribute("id");
        card.classList.toggle("active", phase.cards.includes(id));
      });
    }

    function resizeCanvas() {
      const rect = stage.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function getAnchorPoint(id) {
      const element = document.getElementById(id);
      const rect = element.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      return {
        x: rect.left - stageRect.left + rect.width / 2,
        y: rect.top - stageRect.top + rect.height / 2
      };
    }

    function buildCurve(def) {
      const from = getAnchorPoint(def.from);
      const to = getAnchorPoint(def.to);
      const horizontal = to.x >= from.x;
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const controlA = {
        x: from.x + dx * 0.34,
        y: from.y + (horizontal ? -1 : 1) * dy * def.bend
      };
      const controlB = {
        x: from.x + dx * 0.72,
        y: to.y - (horizontal ? -1 : 1) * dy * def.bend
      };
      return { from, to, controlA, controlB };
    }

    function pointOnCurve(curve, t) {
      const inv = 1 - t;
      const x =
        inv * inv * inv * curve.from.x +
        3 * inv * inv * t * curve.controlA.x +
        3 * inv * t * t * curve.controlB.x +
        t * t * t * curve.to.x;
      const y =
        inv * inv * inv * curve.from.y +
        3 * inv * inv * t * curve.controlA.y +
        3 * inv * t * t * curve.controlB.y +
        t * t * t * curve.to.y;
      return { x, y };
    }

    function drawCurve(curveDef, time, index) {
      const curve = buildCurve(curveDef);
      ctx.save();
      ctx.lineWidth = curveDef.width;
      ctx.strokeStyle = curveDef.color;
      ctx.globalAlpha = 0.42;
      ctx.setLineDash([10, 10]);
      ctx.lineDashOffset = -(time * 0.03 * (index + 1));
      ctx.beginPath();
      ctx.moveTo(curve.from.x, curve.from.y);
      ctx.bezierCurveTo(curve.controlA.x, curve.controlA.y, curve.controlB.x, curve.controlB.y, curve.to.x, curve.to.y);
      ctx.stroke();
      ctx.restore();

      for (let particleIndex = 0; particleIndex < curveDef.particles; particleIndex++) {
        const progress = ((time / 1000) * curveDef.speed + particleIndex / curveDef.particles) % 1;
        const point = pointOnCurve(curve, progress);
        const radius = 2.5 + ((particleIndex + index) % 3);

        ctx.save();
        ctx.fillStyle = curveDef.color;
        ctx.globalAlpha = 0.32 + (1 - progress) * 0.6;
        ctx.shadowColor = curveDef.color;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function drawCoreSparkles(time) {
      const core = getAnchorPoint("core");
      const radius = Math.min(stage.clientWidth, stage.clientHeight) * 0.09;

      for (let index = 0; index < 16; index++) {
        const angle = time * 0.0008 + index * 0.3926990817;
        const distance = radius + Math.sin(time * 0.0016 + index) * 22;
        const x = core.x + Math.cos(angle) * distance;
        const y = core.y + Math.sin(angle) * distance;

        ctx.save();
        ctx.fillStyle = index % 3 === 0 ? data.theme.accentWarm : data.theme.accentSuccess;
        ctx.globalAlpha = 0.3 + Math.sin(time * 0.004 + index) * 0.12;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(x, y, 2.3 + (index % 3), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function render(time) {
      resizeCanvas();
      ctx.clearRect(0, 0, stage.clientWidth, stage.clientHeight);

      if (time - lastPhaseShift > 3200) {
        lastPhaseShift = time;
        setPhase(activePhase + 1);
      }

      curves.forEach((curveDef, index) => drawCurve(curveDef, time, index));
      drawCoreSparkles(time);
      requestAnimationFrame(render);
    }

    setPhase(0);
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    requestAnimationFrame(render);
  </script>
</body>
</html>`
}
