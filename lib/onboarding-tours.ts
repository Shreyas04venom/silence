import { TourStep } from "@/components/onboarding-tour"

export const teacherDashboardTour: TourStep[] = [
  {
    target: "[data-tour='welcome']",
    title: "Welcome to Silent Classrooms! 👋",
    description: "Let's take a quick tour to help you get started with creating visual lessons for deaf and hard-of-hearing students.",
    position: "bottom",
    icon: "🎓",
  },
  {
    target: "[data-tour='record-button']",
    title: "Start Recording Your Lesson",
    description: "Click 'Start Recording' to begin speaking your educational concept. You can also type it directly if you prefer.",
    position: "bottom",
    icon: "🎤",
  },
  {
    target: "[data-tour='transcript']",
    title: "Live Transcript",
    description: "Your speech is converted to text in real-time. You can edit the transcript directly if needed.",
    position: "top",
    icon: "📝",
  },
  {
    target: "[data-tour='generate-button']",
    title: "Generate Visual Content",
    description: "Click this button to generate educational images, videos, and sign language content from your lesson.",
    position: "bottom",
    icon: "✨",
  },
  {
    target: "[data-tour='tabs']",
    title: "Explore Generated Content",
    description: "Switch between tabs to view explanations, images, videos, and accessibility features for your lesson.",
    position: "bottom",
    icon: "📚",
  },
  {
    target: "[data-tour='save-button']",
    title: "Save Your Session",
    description: "Save your lesson to access it later. Sessions are synced to the cloud automatically.",
    position: "bottom",
    icon: "💾",
  },
  {
    target: "[data-tour='sessions-button']",
    title: "Manage Saved Lessons",
    description: "View and manage all your saved lessons. You can share them with students or edit them anytime.",
    position: "bottom",
    icon: "📂",
  },
]

export const studentDashboardTour: TourStep[] = [
  {
    target: "[data-tour='welcome']",
    title: "Welcome, Student! 🎉",
    description: "This is your learning dashboard where you can access all your visual lessons and educational content.",
    position: "bottom",
    icon: "📖",
  },
  {
    target: "[data-tour='sessions-list']",
    title: "Your Saved Lessons",
    description: "All your lessons are saved here. Click on any lesson to view its content, videos, and sign language guides.",
    position: "right",
    icon: "📚",
  },
  {
    target: "[data-tour='session-card']",
    title: "Lesson Cards",
    description: "Each card shows a lesson with its topic, date, and duration. Click to open and start learning!",
    position: "bottom",
    icon: "🎯",
  },
  {
    target: "[data-tour='content-tabs']",
    title: "Learning Materials",
    description: "Switch between different types of content: explanations, images, videos, and sign language guides.",
    position: "bottom",
    icon: "🎬",
  },
  {
    target: "[data-tour='video-player']",
    title: "Watch Educational Videos",
    description: "Videos are automatically selected and trimmed to show only the relevant concept. Use the caption button for subtitles!",
    position: "top",
    icon: "▶️",
  },
  {
    target: "[data-tour='sign-language']",
    title: "Sign Language Fingerspelling",
    description: "Learn how to sign each letter of the concept using real American Sign Language hand signs.",
    position: "top",
    icon: "✋",
  },
]

export const demoPageTour: TourStep[] = [
  {
    target: "[data-tour='demo-welcome']",
    title: "Try Silent Classrooms Demo! 🚀",
    description: "Experience how our platform helps deaf students learn through visual content. Let's explore the features!",
    position: "bottom",
    icon: "🎪",
  },
  {
    target: "[data-tour='demo-topics']",
    title: "Choose a Topic",
    description: "Select from pre-loaded educational topics or type your own concept to see how it's transformed into visual content.",
    position: "bottom",
    icon: "🔍",
  },
  {
    target: "[data-tour='demo-generate']",
    title: "Generate Content",
    description: "Click to generate educational images, animated videos, and sign language guides for the selected topic.",
    position: "bottom",
    icon: "⚡",
  },
  {
    target: "[data-tour='demo-explanation']",
    title: "AI-Generated Explanation",
    description: "Read a clear, student-friendly explanation of the concept written specifically for visual learners.",
    position: "bottom",
    icon: "💡",
  },
  {
    target: "[data-tour='demo-images']",
    title: "Educational Diagrams",
    description: "View detailed diagrams and illustrations that explain the concept visually without relying on audio.",
    position: "bottom",
    icon: "🖼️",
  },
  {
    target: "[data-tour='demo-videos']",
    title: "Animated Videos",
    description: "Watch carefully selected animated educational videos with captions. Perfect for visual learning!",
    position: "top",
    icon: "🎥",
  },
  {
    target: "[data-tour='demo-asl']",
    title: "Sign Language Support",
    description: "See real American Sign Language fingerspelling for each letter of the concept using our dataset.",
    position: "top",
    icon: "👋",
  },
  {
    target: "[data-tour='demo-signup']",
    title: "Ready to Get Started?",
    description: "Sign up now to create unlimited lessons, save your content, and help deaf students learn better!",
    position: "bottom",
    icon: "🎓",
  },
]

// Helper function to check if user has completed onboarding
export function hasCompletedOnboarding(userType: "teacher" | "student"): boolean {
  if (typeof window === "undefined") return true
  const key = `onboarding_completed_${userType}`
  return localStorage.getItem(key) === "true"
}

// Helper function to mark onboarding as completed
export function markOnboardingComplete(userType: "teacher" | "student"): void {
  if (typeof window === "undefined") return
  const key = `onboarding_completed_${userType}`
  localStorage.setItem(key, "true")
}

// Helper function to reset onboarding (for testing)
export function resetOnboarding(userType: "teacher" | "student"): void {
  if (typeof window === "undefined") return
  const key = `onboarding_completed_${userType}`
  localStorage.removeItem(key)
}

// Demo page always shows tour (no localStorage check)
export function shouldShowDemoTour(): boolean {
  return true // Always show on demo page
}
