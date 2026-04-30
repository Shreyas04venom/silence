/**
 * Authentication Helper Functions
 * Handles auth state checking and persistence
 */

import { auth, firestore } from "./firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

/**
 * Wait for Firebase Auth to initialize and check current user
 * This prevents redirecting to login when user is actually logged in
 */
export function waitForAuthInit(): Promise<User | null> {
  return new Promise((resolve) => {
    if (!auth) {
      resolve(null)
      return
    }

    // If auth is already initialized and has a user, return immediately
    if (auth.currentUser) {
      console.log("✓ Auth already initialized, user:", auth.currentUser.email)
      resolve(auth.currentUser)
      return
    }

    // Otherwise, wait for auth state to be determined
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("✓ Auth state determined:", user ? user.email : "No user")
      unsubscribe()
      resolve(user)
    })

    // Timeout after 5 seconds
    setTimeout(() => {
      console.warn("⚠️ Auth state check timed out")
      unsubscribe()
      resolve(null)
    }, 5000)
  })
}

/**
 * Check if user has a specific role in Firestore
 */
export async function checkUserRole(userId: string, expectedRole: 'teacher' | 'student'): Promise<boolean> {
  if (!firestore) return false

  try {
    const profileDoc = await getDoc(doc(firestore, "profiles", userId))
    if (!profileDoc.exists()) {
      console.warn(`⚠️ Profile not found for user: ${userId}`)
      return false
    }

    const role = profileDoc.data()?.role
    console.log(`✓ User role: ${role}, expected: ${expectedRole}`)
    return role === expectedRole
  } catch (error) {
    console.error("❌ Error checking user role:", error)
    return false
  }
}

/**
 * Get current authenticated user with role
 */
export async function getCurrentUserWithRole(): Promise<{ user: User; role: 'teacher' | 'student' } | null> {
  const user = await waitForAuthInit()
  if (!user || !firestore) return null

  try {
    const profileDoc = await getDoc(doc(firestore, "profiles", user.uid))
    if (!profileDoc.exists()) return null

    const role = profileDoc.data()?.role
    if (role !== 'teacher' && role !== 'student') return null

    return { user, role }
  } catch (error) {
    console.error("❌ Error getting user with role:", error)
    return null
  }
}
