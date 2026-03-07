import { adminAuth } from '@/lib/firebase/admin'
import { SESSION_COOKIE } from '@/lib/firebase/session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST() {
	const cookieStore = await cookies()
	const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value

	if (sessionCookie) {
		try {
			const decoded = await adminAuth().verifySessionCookie(sessionCookie)
			// Revoke all refresh tokens so existing sessions on other devices are also invalidated
			await adminAuth().revokeRefreshTokens(decoded.uid)
		} catch {
			// Session already expired or invalid — proceed to clear cookie
		}
	}

	const res = NextResponse.redirect(
		new URL('/login', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
	)
	res.cookies.delete(SESSION_COOKIE)
	return res
}
