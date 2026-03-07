import { cookies } from 'next/headers'
import { adminAuth } from './admin'

export const SESSION_COOKIE = '__session'
/** 14 days */
export const SESSION_DURATION_MS = 60 * 60 * 24 * 14 * 1000

export interface ServerUser {
	uid: string
	email?: string
	name?: string
}

/**
 * Reads and verifies the __session cookie using Firebase Admin.
 * Returns the decoded user or null if the session is missing/invalid.
 * Call this in Server Components and API routes — never in Client Components.
 */
export async function getServerUser(): Promise<ServerUser | null> {
	try {
		const cookieStore = await cookies()
		const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value
		if (!sessionCookie) return null

		const decoded = await adminAuth().verifySessionCookie(sessionCookie, true)
		return { uid: decoded.uid, email: decoded.email, name: decoded.name as string | undefined }
	} catch {
		return null
	}
}
