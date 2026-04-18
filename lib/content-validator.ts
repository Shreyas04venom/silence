/**
 * Educational Content Validator
 * Client-side: fast local check + AI fallback via /api/validate-content
 */

export interface ValidationResult {
  isEducational: boolean
  confidence: number
  reason?: string
  guidance?: string
  suggestedTopic?: string
}

// ── Extended educational keyword list (Maharashtra Board Std 6–8) ─────────────
const EDUCATIONAL_KEYWORDS = [
  // Life Science
  "photosynthesis", "cell", "organism", "digestion", "respiration", "circulation",
  "nervous system", "ecosystem", "food chain", "nutrition", "reproduction",
  "skeleton", "muscle", "blood", "heart", "lung", "kidney", "liver", "stomach",
  "intestine", "chlorophyll", "stomata", "glucose", "oxygen", "carbon dioxide",
  "enzyme", "hormone", "bacteria", "virus", "fungi", "plant", "animal",
  "habitat", "adaptation", "evolution", "genetics", "dna", "protein",
  "mitosis", "meiosis", "pollination", "germination", "vaccination",

  // Physical Science & Chemistry
  "atom", "molecule", "element", "compound", "acid", "base", "salt",
  "chemical", "reaction", "combustion", "oxidation", "metal", "non-metal",
  "periodic table", "bond", "electron", "proton", "neutron", "isotope",
  "force", "gravity", "friction", "pressure", "energy", "work", "power",
  "motion", "velocity", "acceleration", "momentum", "density", "buoyancy",
  "heat", "temperature", "light", "sound", "wave", "reflection", "refraction",
  "electricity", "current", "voltage", "magnet", "magnetic", "circuit",
  "lens", "prism", "spectrum", "electromagnetic",

  // Mathematics
  "equation", "algebra", "geometry", "triangle", "circle", "rectangle",
  "quadrilateral", "polygon", "angle", "parallel", "perpendicular",
  "addition", "subtraction", "multiplication", "division", "fraction",
  "decimal", "percentage", "ratio", "proportion", "probability",
  "variable", "expression", "polynomial", "factorisation", "linear",
  "quadratic", "logarithm", "exponent", "square root", "cube root",
  "area", "perimeter", "volume", "surface area", "mensuration",
  "graph", "statistics", "mean", "median", "mode", "data",
  "integer", "rational", "irrational", "prime", "factor", "multiple",

  // Geography & Environment
  "climate", "weather", "soil", "water cycle", "ecosystem", "forest",
  "resources", "pollution", "conservation", "atmosphere", "latitude",
  "longitude", "continent", "ocean", "river", "mountain", "earthquake",
  "volcano", "erosion", "agriculture", "industry",

  // History & Civics
  "civilization", "empire", "kingdom", "democracy", "constitution",
  "revolution", "independence", "trade", "culture", "religion",
  "mughal", "british", "colonial", "freedom", "rights", "parliament",

  // General Academic
  "definition", "concept", "process", "system", "structure", "function",
  "diagram", "experiment", "hypothesis", "theory", "law", "principle",
  "formula", "proof", "theorem", "corollary",
  "std", "standard", "class", "chapter", "lesson", "topic",
  "science", "mathematics", "maths", "history", "geography",
  "social science", "english", "hindi", "marathi",
]

// ── Specific wrong-input detection ───────────────────────────────────────────
interface WrongInputType {
  pattern: RegExp
  guidance: string
}

const WRONG_INPUT_RULES: WrongInputType[] = [
  {
    pattern: /\b\d{10,}\b/,
    guidance:
      "That looks like a phone number or account number. Please enter an educational topic like 'photosynthesis' or 'digestive system'.",
  },
  {
    pattern: /\b(bank|account|ifsc|pan\s?card|aadhar|aadhaar|statement|balance|otp|cvv|upi|neft|rtgs|imps)\b/i,
    guidance:
      "This appears to be financial or personal document data. Please enter a school curriculum topic instead — for example, 'Force and Pressure' or 'Algebra'.",
  },
  {
    pattern: /\b(passport|visa|driving\s?license|voter|ration\s?card|insurance)\b/i,
    guidance:
      "This looks like personal document data. Please enter an educational topic from your school syllabus.",
  },
  {
    pattern: /\b(movie|film|bollywood|hollywood|netflix|ott|web\s?series|celebrity|actor|actress)\b/i,
    guidance:
      "This is entertainment content. Please type an educational concept — for example, 'Light — Reflection and Refraction' or 'Reproduction in Plants'.",
  },
  {
    pattern: /\b(ipl|cricket|football|kabaddi|sport|match|tournament|team|player|score)\b/i,
    guidance:
      "Sports content can't be used for lesson generation. Please enter a subject topic from your curriculum.",
  },
  {
    pattern: /\b(whatsapp|instagram|facebook|twitter|youtube comment|like|follow|share|dm|meme)\b/i,
    guidance:
      "Social media content is not supported. Please enter a school subject topic to generate visual learning content.",
  },
  {
    pattern: /^(hi|hello|hey|hii|helo|wassup|what'?s?\s?up|namaste|jai\s?hind)\b/i,
    guidance:
      "Please enter an educational topic (not a greeting). Example: 'Nervous System', 'Quadrilaterals', or 'The Mughal Empire'.",
  },
  {
    pattern: /\b(buy|sell|price|cost|offer|discount|shop|order|delivery|amazon|flipkart)\b/i,
    guidance:
      "Shopping content is not supported. Please enter an academic topic from the Maharashtra State Board curriculum.",
  },
]

function getWrongInputGuidance(text: string): string | null {
  for (const rule of WRONG_INPUT_RULES) {
    if (rule.pattern.test(text)) return rule.guidance
  }
  return null
}

// ── Local fast validation (no API call) ──────────────────────────────────────
export function validateContentLocally(text: string): ValidationResult {
  const lower = text.toLowerCase().trim()

  if (!lower || lower.length < 3) {
    return {
      isEducational: false,
      confidence: 1,
      reason: "Input too short.",
      guidance: "Please enter a complete educational topic.",
    }
  }

  // Check specific wrong-input patterns first
  const wrongGuidance = getWrongInputGuidance(lower)
  if (wrongGuidance) {
    return {
      isEducational: false,
      confidence: 0.9,
      reason: "Input does not appear educational.",
      guidance: wrongGuidance,
    }
  }

  // Count educational keyword matches
  let keywordCount = 0
  for (const kw of EDUCATIONAL_KEYWORDS) {
    if (lower.includes(kw)) keywordCount++
  }

  const wordCount = text.trim().split(/\s+/).length
  const density = keywordCount / Math.max(wordCount, 1)

  if (keywordCount >= 2 || density >= 0.15) {
    return { isEducational: true, confidence: Math.min(0.7 + density, 0.98) }
  }

  if (keywordCount === 1) {
    return {
      isEducational: true,
      confidence: 0.55,
      reason: "Content may be educational — sending to AI for validation.",
    }
  }

  // Very short single unknown word — be permissive (teacher might say just "osmosis")
  if (wordCount <= 2 && /^[a-z\s\-']+$/i.test(text)) {
    return {
      isEducational: true,
      confidence: 0.45,
      reason: "Short term — assuming educational.",
    }
  }

  return {
    isEducational: false,
    confidence: 0.65,
    reason: "Content does not appear educational.",
    guidance:
      "Please enter a topic from your school curriculum. Example: 'Photosynthesis', 'Triangles', 'The Water Cycle'.",
  }
}

// ── AI-powered validation via /api/validate-content ──────────────────────────
export async function validateContentWithAI(text: string): Promise<ValidationResult> {
  // Run local check first — if clearly educational, skip API call
  const local = validateContentLocally(text)
  if (local.isEducational && local.confidence >= 0.7) return local

  // If clearly not educational locally, also skip API (trust local detection)
  if (!local.isEducational && local.confidence >= 0.85) return local

  try {
    const res = await fetch("/api/validate-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })

    if (!res.ok) return local

    const data = await res.json()

    // Merge guidance: prefer AI reason, fall back to local guidance
    return {
      ...data,
      guidance: data.reason || local.guidance,
    }
  } catch {
    // Network failure — fall back to local result silently
    return local
  }
}
