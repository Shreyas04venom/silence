import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ClassesListContent } from "@/components/classes/classes-list-content"
import { isFigmaMockRequest, mockClasses } from "@/lib/figma-mock-data"

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ figmaMock?: string }>
}) {
  const { figmaMock } = await searchParams
  if (isFigmaMockRequest(figmaMock)) {
    return <ClassesListContent classes={mockClasses} />
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get all classes with student counts
  const { data: classes } = await supabase
    .from("classes")
    .select(`
      *,
      class_assignments(
        student:profiles(id, name, roll_no)
      )
    `)
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false })

  return <ClassesListContent classes={classes || []} />
}
