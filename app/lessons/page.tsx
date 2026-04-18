import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LessonsListContent } from "@/components/lessons/lessons-list-content"
import { isFigmaMockRequest, mockLessons, mockSubjects } from "@/lib/figma-mock-data"

export default async function LessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ figmaMock?: string }>
}) {
  const { figmaMock } = await searchParams
  if (isFigmaMockRequest(figmaMock)) {
    return <LessonsListContent lessons={mockLessons} subjects={mockSubjects} />
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get all lessons for this teacher
  const { data: lessons } = await supabase
    .from("lessons")
    .select(`
      *,
      subject:subjects(id, name, grade)
    `)
    .eq("teacher_id", user.id)
    .order("updated_at", { ascending: false })

  // Get all subjects
  const { data: subjects } = await supabase.from("subjects").select("*").order("grade").order("name")

  return <LessonsListContent lessons={lessons || []} subjects={subjects || []} />
}
