import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LessonDetailContent } from "@/components/lessons/lesson-detail-content"
import { isFigmaMockRequest, mockLessonDetail } from "@/lib/figma-mock-data"

export default async function LessonDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ figmaMock?: string }>
}) {
  const { id } = await params
  const { figmaMock } = await searchParams
  if (isFigmaMockRequest(figmaMock)) {
    return <LessonDetailContent lesson={{ ...mockLessonDetail, id }} />
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select(`
      *,
      subject:subjects(id, name, grade, board),
      concepts(id, index, title, notes, sign_language_video_url),
      media_resources(id, media_type, source, url, thumbnail_url, title, meta)
    `)
    .eq("id", id)
    .single()

  if (error || !lesson) {
    notFound()
  }

  return <LessonDetailContent lesson={lesson} />
}
