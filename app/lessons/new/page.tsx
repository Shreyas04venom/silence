import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NewLessonContent } from "@/components/lessons/new-lesson-content"
import { isFigmaMockRequest, mockSubjects } from "@/lib/figma-mock-data"

export default async function NewLessonPage({
  searchParams,
}: {
  searchParams: Promise<{ figmaMock?: string }>
}) {
  const { figmaMock } = await searchParams
  if (isFigmaMockRequest(figmaMock)) {
    return <NewLessonContent subjects={mockSubjects} />
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get all subjects
  const { data: subjects } = await supabase.from("subjects").select("*").order("grade").order("name")

  return <NewLessonContent subjects={subjects || []} />
}
