import { adminAuth } from '@/lib/firebase/admin'
import { SESSION_COOKIE, SESSION_DURATION_MS } from '@/lib/firebase/session'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * POST /api/auth/session
 * Creates an HTTP-only Firebase session cookie from a client-side ID token.
 * Called right after signInWithEmailAndPassword / signInWithPopup on the client.
 */
export async function POST(req: NextRequest) {
	try {
		const { idToken } = (await req.json()) as { idToken?: string }

		if (!idToken) {
			return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })
		}

		const sessionCookie = await adminAuth().createSessionCookie(idToken, {
			expiresIn: SESSION_DURATION_MS,
		})

		const res = NextResponse.json({ ok: true })
		res.cookies.set(SESSION_COOKIE, sessionCookie, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: SESSION_DURATION_MS / 1000,
			path: '/',
		})

		return res
	} catch (err) {
		console.error('[auth/session] Failed to create session cookie:', err)
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}
}
