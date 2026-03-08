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
		// Fail fast if Firebase Admin is not configured (e.g. missing env on Vercel)
		if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
			console.error('[auth/session] Missing FIREBASE_ADMIN_PROJECT_ID or FIREBASE_ADMIN_PRIVATE_KEY')
			return NextResponse.json(
				{
					error: 'Server misconfigured: Firebase Admin env vars not set. Add FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in Vercel → Settings → Environment Variables, then redeploy.',
				},
				{ status: 500 },
			)
		}

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
		const message = err instanceof Error ? err.message : String(err)
		console.error('[auth/session] Failed to create session cookie:', message)
		// Hint: 401 usually means Firebase Admin credentials don't match client project, or env vars missing
		const hint =
			process.env.NODE_ENV === 'development'
				? ` ${message}`
				: '. Check FIREBASE_ADMIN_* env vars and that they match the same Firebase project as NEXT_PUBLIC_FIREBASE_*.'
		return NextResponse.json({ error: 'Unauthorized' + hint }, { status: 401 })
	}
}
