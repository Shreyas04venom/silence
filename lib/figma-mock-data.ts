import type { Class, Concept, Lesson, MediaResource, Profile, Subject } from "@/lib/types"

const baseCreatedAt = "2026-03-20T09:00:00.000Z"
const baseUpdatedAt = "2026-03-20T10:30:00.000Z"

export const mockTeacherDisplayName = "Meera Patil"
export const mockStudentDisplayName = "Aarav Kulkarni"

export const isFigmaMockRequest = (value?: string) => value === "1" || value === "true"

export const mockSubjects: Subject[] = [
  {
    id: "figma-subject-science-6",
    board: "Maharashtra State Board",
    name: "Science",
    grade: "Std 6",
    description: "Foundational life science with visual-first teaching aids.",
    icon: "microscope",
    created_by: "figma-teacher-1",
    created_at: baseCreatedAt,
  },
  {
    id: "figma-subject-maths-7",
    board: "Maharashtra State Board",
    name: "Mathematics",
    grade: "Std 7",
    description: "Algebra and number sense with guided visual practice.",
    icon: "calculator",
    created_by: "figma-teacher-1",
    created_at: baseCreatedAt,
  },
  {
    id: "figma-subject-science-8",
    board: "Maharashtra State Board",
    name: "Science",
    grade: "Std 8",
    description: "Human body systems and ecology with structured media support.",
    icon: "flask",
    created_by: "figma-teacher-1",
    created_at: baseCreatedAt,
  },
]

const [scienceStd6, mathsStd7, scienceStd8] = mockSubjects

export const mockLessons: Array<Lesson & { subject: Subject }> = [
  {
    id: "figma-lesson-photosynthesis",
    subject_id: scienceStd6.id,
    teacher_id: "figma-teacher-1",
    title: "Photosynthesis in Action",
    topic: "Nutrition in Plants",
    lesson_text:
      "Plants use sunlight, carbon dioxide, water, and chlorophyll to prepare glucose and release oxygen. Leaves act like food factories.",
    summary:
      "This lesson explains how green plants make food using sunlight and why leaves, stomata, and chlorophyll are essential to the process.",
    keywords: ["sunlight", "chlorophyll", "stomata", "glucose", "oxygen"],
    is_published: true,
    created_at: baseCreatedAt,
    updated_at: baseUpdatedAt,
    subject: scienceStd6,
  },
  {
    id: "figma-lesson-digestive",
    subject_id: scienceStd8.id,
    teacher_id: "figma-teacher-1",
    title: "Journey Through the Digestive System",
    topic: "Human Digestive System",
    lesson_text:
      "Food moves through the mouth, food pipe, stomach, and intestines where digestion and absorption happen in stages.",
    summary:
      "Students follow the path of food through the body and understand the role of major digestive organs.",
    keywords: ["mouth", "stomach", "enzymes", "small intestine", "absorption"],
    is_published: true,
    created_at: "2026-03-18T11:15:00.000Z",
    updated_at: "2026-03-19T09:45:00.000Z",
    subject: scienceStd8,
  },
  {
    id: "figma-lesson-equations",
    subject_id: mathsStd7.id,
    teacher_id: "figma-teacher-1",
    title: "Balancing Simple Equations",
    topic: "Equations",
    lesson_text:
      "An equation stays balanced when the same operation is done on both sides. Visual balance scales help students reason step by step.",
    summary:
      "A guided introduction to solving one-step equations using a balance model and everyday examples.",
    keywords: ["variables", "equals", "balance", "inverse operations"],
    is_published: false,
    created_at: "2026-03-15T10:00:00.000Z",
    updated_at: "2026-03-17T08:20:00.000Z",
    subject: mathsStd7,
  },
]

export const mockLessonConcepts: Concept[] = [
  {
    id: "figma-concept-1",
    lesson_id: mockLessons[0].id,
    index: 0,
    title: "Leaves work like food factories",
    notes: "Leaves contain chlorophyll, which traps sunlight needed to start photosynthesis.",
    sign_language_video_url: "",
    created_at: baseCreatedAt,
  },
  {
    id: "figma-concept-2",
    lesson_id: mockLessons[0].id,
    index: 1,
    title: "Raw materials enter the plant",
    notes: "Roots absorb water while stomata on leaves take in carbon dioxide from the air.",
    sign_language_video_url: "",
    created_at: baseCreatedAt,
  },
  {
    id: "figma-concept-3",
    lesson_id: mockLessons[0].id,
    index: 2,
    title: "Glucose is made and oxygen is released",
    notes: "Sunlight powers the conversion that creates food for the plant and releases oxygen back into the atmosphere.",
    sign_language_video_url: "",
    created_at: baseCreatedAt,
  },
]

export const mockLessonMediaResources: MediaResource[] = [
  {
    id: "figma-media-1",
    lesson_id: mockLessons[0].id,
    teacher_id: "figma-teacher-1",
    media_type: "image",
    source: "local",
    url: "/content/std-6/science/basic-life-processes/nutrition-in-plants/image-1-photosynthesis-process.png",
    thumbnail_url: "/content/std-6/science/basic-life-processes/nutrition-in-plants/image-1-photosynthesis-process.png",
    title: "Photosynthesis process diagram",
    meta: {},
    created_at: baseCreatedAt,
  },
  {
    id: "figma-media-2",
    lesson_id: mockLessons[0].id,
    teacher_id: "figma-teacher-1",
    media_type: "image",
    source: "local",
    url: "/content/std-6/science/basic-life-processes/nutrition-in-plants/image-2-plant-structure.png",
    thumbnail_url: "/content/std-6/science/basic-life-processes/nutrition-in-plants/image-2-plant-structure.png",
    title: "Leaf and stem structure",
    meta: {},
    created_at: baseCreatedAt,
  },
  {
    id: "figma-media-3",
    lesson_id: mockLessons[0].id,
    teacher_id: "figma-teacher-1",
    media_type: "video",
    source: "youtube",
    url: "https://www.youtube.com/watch?v=UPBMG5EYydo",
    thumbnail_url: "",
    title: "Photosynthesis explainer",
    meta: { youtubeId: "UPBMG5EYydo" },
    created_at: baseCreatedAt,
  },
]

export const mockLessonDetail: Lesson & {
  subject: Subject
  concepts: Concept[]
  media_resources: MediaResource[]
} = {
  ...mockLessons[0],
  subject: scienceStd6,
  concepts: mockLessonConcepts,
  media_resources: mockLessonMediaResources,
}

const mockStudentProfiles: Profile[] = [
  {
    id: "figma-student-1",
    name: "Aarav Kulkarni",
    role: "student",
    roll_no: "STD6A-014",
    preferred_language: "English",
    created_at: "2026-03-05T09:00:00.000Z",
    updated_at: "2026-03-19T09:00:00.000Z",
  },
  {
    id: "figma-student-2",
    name: "Sara Shaikh",
    role: "student",
    roll_no: "STD6A-018",
    preferred_language: "English",
    created_at: "2026-03-05T09:00:00.000Z",
    updated_at: "2026-03-19T09:00:00.000Z",
  },
  {
    id: "figma-student-3",
    name: "Vihaan Jadhav",
    role: "student",
    roll_no: "STD7B-006",
    preferred_language: "English",
    created_at: "2026-03-08T09:00:00.000Z",
    updated_at: "2026-03-19T09:00:00.000Z",
  },
]

export const mockClasses: Array<Class & { class_assignments?: Array<{ student: Profile }> }> = [
  {
    id: "figma-class-6a",
    name: "Std 6A - Visual Science",
    grade: "Std 6",
    teacher_id: "figma-teacher-1",
    description: "Main inclusion classroom with a strong focus on visual science reinforcement and recap sessions.",
    created_at: "2026-03-01T09:00:00.000Z",
    class_assignments: [{ student: mockStudentProfiles[0] }, { student: mockStudentProfiles[1] }],
  },
  {
    id: "figma-class-7b",
    name: "Std 7B - Math Lab",
    grade: "Std 7",
    teacher_id: "figma-teacher-1",
    description: "Hands-on algebra practice group using large-format displays and guided prompts.",
    created_at: "2026-03-02T09:00:00.000Z",
    class_assignments: [{ student: mockStudentProfiles[2] }],
  },
]

export const mockClassDetail: Class & {
  class_assignments: Array<{ id: string; student: Profile }>
} = {
  id: "figma-class-6a",
  name: "Std 6A - Visual Science",
  grade: "Std 6",
  teacher_id: "figma-teacher-1",
  description: "Main inclusion classroom with a strong focus on visual science reinforcement and recap sessions.",
  created_at: "2026-03-01T09:00:00.000Z",
  class_assignments: [
    { id: "figma-class-assignment-1", student: mockStudentProfiles[0] },
    { id: "figma-class-assignment-2", student: mockStudentProfiles[1] },
  ],
}

export const mockAssignableLessons = mockLessons.map((lesson) => ({
  id: lesson.id,
  title: lesson.title,
  subject: lesson.subject ? { name: lesson.subject.name } : null,
}))

export const mockAssignedLessons = [
  {
    id: "figma-lesson-assignment-1",
    lesson: {
      id: mockLessons[0].id,
      title: mockLessons[0].title,
      subject: { name: mockLessons[0].subject.name },
    },
    assigned_at: "2026-03-19T07:45:00.000Z",
  },
  {
    id: "figma-lesson-assignment-2",
    lesson: {
      id: mockLessons[1].id,
      title: mockLessons[1].title,
      subject: { name: mockLessons[1].subject.name },
    },
    assigned_at: "2026-03-18T06:15:00.000Z",
  },
]

export const mockAnalyticsStats = {
  totalViews: 186,
  totalUnderstood: 121,
  totalReplays: 42,
}

export const mockLessonStats = [
  {
    id: mockLessons[0].id,
    title: mockLessons[0].title,
    subject: { name: mockLessons[0].subject.name, grade: mockLessons[0].subject.grade },
    views: 64,
    understood: 48,
    replays: 15,
  },
  {
    id: mockLessons[1].id,
    title: mockLessons[1].title,
    subject: { name: mockLessons[1].subject.name, grade: mockLessons[1].subject.grade },
    views: 79,
    understood: 51,
    replays: 18,
  },
  {
    id: mockLessons[2].id,
    title: mockLessons[2].title,
    subject: { name: mockLessons[2].subject.name, grade: mockLessons[2].subject.grade },
    views: 43,
    understood: 22,
    replays: 9,
  },
]

export const mockRecentProgress = [
  {
    id: "figma-progress-1",
    action: "understood",
    created_at: "2026-03-20T09:10:00.000Z",
    student: { name: mockStudentProfiles[0].name },
    lesson: { title: mockLessons[0].title },
  },
  {
    id: "figma-progress-2",
    action: "replay",
    created_at: "2026-03-20T09:06:00.000Z",
    student: { name: mockStudentProfiles[1].name },
    lesson: { title: mockLessons[1].title },
  },
  {
    id: "figma-progress-3",
    action: "viewed",
    created_at: "2026-03-20T08:58:00.000Z",
    student: { name: mockStudentProfiles[2].name },
    lesson: { title: mockLessons[2].title },
  },
  {
    id: "figma-progress-4",
    action: "understood",
    created_at: "2026-03-20T08:41:00.000Z",
    student: { name: mockStudentProfiles[1].name },
    lesson: { title: mockLessons[0].title },
  },
]

export const mockDemoGeneratedState = {
  selectedStandard: "6",
  selectedSubject: "Science",
  selectedChapter: "Basic Life Processes",
  selectedTopic: "Nutrition in Plants",
  explanation:
    "Photosynthesis is the process by which green plants make their own food. Leaves contain chlorophyll, which traps sunlight. Roots absorb water from the soil, and tiny openings called stomata take in carbon dioxide from the air. Using sunlight as energy, the plant combines water and carbon dioxide to make glucose, which is stored as food, and releases oxygen into the atmosphere.",
  imageUrl: "/content/std-6/science/basic-life-processes/nutrition-in-plants/image-1-photosynthesis-process.png",
  detailedIllustrationSVG: null as string | null,
  animationUrl: "/content/std-6/science/basic-life-processes/nutrition-in-plants/animation-photosynthesis.html",
  visualTranscript:
    "Step 1: Sunlight reaches the leaf. Step 2: Water travels from the roots to the leaves. Step 3: Carbon dioxide enters through stomata. Step 4: Chlorophyll helps produce glucose. Step 5: Oxygen is released into the air.",
  signLanguageSVG: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 260" width="420" height="220" role="img" aria-label="Illustrated sign language steps for photosynthesis"><rect width="480" height="260" rx="28" fill="#f8fafc"/><circle cx="125" cy="88" r="26" fill="#fde68a"/><path d="M118 118c22 18 36 44 38 72" stroke="#1d4ed8" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M182 84c18 8 34 22 43 41" stroke="#059669" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M266 74c20 6 34 20 46 39" stroke="#f97316" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M174 190c38-16 74-18 120-8" stroke="#0f172a" stroke-width="12" stroke-linecap="round" fill="none"/><circle cx="154" cy="194" r="14" fill="#1d4ed8"/><circle cx="334" cy="114" r="14" fill="#f97316"/><rect x="334" y="154" width="70" height="42" rx="16" fill="#bbf7d0"/><text x="369" y="181" text-anchor="middle" font-size="16" fill="#166534" font-family="Arial, sans-serif">food</text></svg>`,
}
