/**
 * Session Storage for VIC Recordings
 * Saves and loads previous recording sessions for student access
 */

export interface VICSession {
    id: string
    title: string
    timestamp: number
    duration: number
    transcript: string
    translations: Record<string, string>
    images: string[]
    animations: string[]
    videos?: string[] // YouTube video IDs or URLs
    // Generated content fields
    explanation?: string
    imageUrl?: string
    detailedIllustrationSVG?: string
    animationCode?: string
    animationUrl?: string
    signLanguageSVG?: string
    accessibility: {
        visualTranscript: string
        signLanguageData: any[]
    }
    metadata: {
        teacher?: string
        subject?: string
        topic?: string
        standard?: string
    }
    // Session sharing fields
    createdBy?: string // User ID of creator (teacher)
    createdByRole?: 'teacher' | 'student' // Role of creator
    isPublic?: boolean // If true, visible to all students
}

const STORAGE_KEY = "vic_sessions"
const MAX_SESSIONS = 50 // Keep last 50 sessions

export function saveSession(session: VICSession): void {
    try {
        let sessions = getAllSessions()

        // Remove existing session with same ID if it exists (prevent duplicates)
        sessions = sessions.filter(s => s.id !== session.id)

        // Add new session at the beginning
        sessions.unshift(session)

        // Keep only MAX_SESSIONS
        if (sessions.length > MAX_SESSIONS) {
            sessions.splice(MAX_SESSIONS)
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    } catch (error) {
        console.error("Failed to save session:", error)
    }
}

export function getAllSessions(): VICSession[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY)
        return data ? JSON.parse(data) : []
    } catch (error) {
        console.error("Failed to load sessions:", error)
        return []
    }
}

/**
 * Merge cloud sessions with local sessions
 * Called on app start to sync sessions from Supabase
 */
export function mergeSessions(cloudSessions: VICSession[]): void {
    try {
        const localSessions = getAllSessions()
        
        // Create a map of existing session IDs
        const sessionMap = new Map<string, VICSession>()
        
        // Add local sessions first (they're more recent)
        localSessions.forEach(session => {
            sessionMap.set(session.id, session)
        })
        
        // Add cloud sessions (won't overwrite local ones)
        cloudSessions.forEach(session => {
            if (!sessionMap.has(session.id)) {
                sessionMap.set(session.id, session)
            }
        })
        
        // Convert back to array and sort by timestamp (newest first)
        const mergedSessions = Array.from(sessionMap.values())
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, MAX_SESSIONS) // Keep only MAX_SESSIONS
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedSessions))
        console.info(`✓ Merged sessions: ${localSessions.length} local + ${cloudSessions.length} cloud = ${mergedSessions.length} total`)
    } catch (error) {
        console.error("Failed to merge sessions:", error)
    }
}

export function getSession(id: string): VICSession | null {
    const sessions = getAllSessions()
    return sessions.find(s => s.id === id) || null
}

export function deleteSession(id: string): void {
    try {
        const sessions = getAllSessions().filter(s => s.id !== id)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    } catch (error) {
        console.error("Failed to delete session:", error)
    }
}

export function updateSession(id: string, updates: Partial<VICSession>): void {
    try {
        const sessions = getAllSessions()
        const index = sessions.findIndex(s => s.id === id)

        if (index !== -1) {
            sessions[index] = { ...sessions[index], ...updates }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
        }
    } catch (error) {
        console.error("Failed to update session:", error)
    }
}

export function generateSessionId(): string {
    return `vic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`
    } else {
        return `${seconds}s`
    }
}

export function searchSessions(query: string): VICSession[] {
    const sessions = getAllSessions()
    const lowerQuery = query.toLowerCase()

    return sessions.filter(session =>
        session.title.toLowerCase().includes(lowerQuery) ||
        session.transcript.toLowerCase().includes(lowerQuery) ||
        session.metadata.subject?.toLowerCase().includes(lowerQuery) ||
        session.metadata.topic?.toLowerCase().includes(lowerQuery)
    )
}
