"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, firestore } from "@/lib/firebase"
import { VICTeacherDashboard } from "@/components/vic-teacher-dashboard"
import { Loader2, Hand } from "lucide-react"
import { isFigmaMockRequest, mockTeacherDisplayName } from "@/lib/figma-mock-data"

import { Suspense } from "react"

function TeacherDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string>("Teacher")

  useEffect(() => {
    if (isFigmaMockRequest(searchParams.get("figmaMock") ?? undefined)) {
      setUserName(mockTeacherDisplayName)
      setLoading(false)
      return
    }

    // Add a small delay to ensure Firebase Auth is fully initialized
    const checkAuth = async () => {
      // Wait a bit for auth to initialize
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log("[Dashboard] Auth state changed:", user ? user.email : "No user")
        
        if (!user) {
          console.log("[Dashboard] No user, redirecting to login...")
          router.push("/auth/login")
          return
        }

        try {
          console.log("[Dashboard] Checking user profile...")
          const profileDoc = await getDoc(doc(firestore, "profiles", user.uid))
          
          if (!profileDoc.exists()) {
            console.warn("[Dashboard] Profile not found, redirecting to login...")
            await auth.signOut()
            router.push("/auth/login")
            return
          }
          
          const profile = profileDoc.data()
          console.log("[Dashboard] Profile found, role:", profile?.role)

          if (profile.role !== "teacher") {
            console.warn("[Dashboard] Not a teacher, redirecting...")
            await auth.signOut()
            router.push("/auth/student-login")
            return
          }

          console.log("[Dashboard] ✓ Teacher authenticated:", user.email)
          setUserName(profile.name || user.displayName || "Teacher")
          setLoading(false)
        } catch (err) {
          console.error("[Dashboard] Error fetching profile:", err)
          router.push("/auth/login")
          return
        }
      })

      return unsubscribe
    }

    const unsubscribePromise = checkAuth()
    
    return () => {
      unsubscribePromise.then(unsub => unsub?.())
    }
  }, [router, searchParams])

  if (loading) {
    return <DashboardLoading />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg">
              <Hand className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold">Silent Classrooms</span>
              <p className="text-sm text-muted-foreground">Teacher Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {userName}</span>
            <button
              className="text-sm text-destructive hover:underline"
              onClick={async () => {
                await auth.signOut()
                router.push("/")
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* VIC Teacher Dashboard — same as demo-learn */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <VICTeacherDashboard onClose={() => router.push("/")} />
      </main>
    </div>
  )
}

function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
        <Hand className="w-7 h-7 text-primary-foreground" />
      </div>
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading your dashboard...</p>
    </div>
  )
}

export default function TeacherDashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <TeacherDashboardContent />
    </Suspense>
  )
}
