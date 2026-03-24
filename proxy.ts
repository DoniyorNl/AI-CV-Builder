import { type NextRequest, NextResponse } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/builder', '/billing']
const SESSION_COOKIE = '__session'

/**
 * Lightweight edge-compatible proxy.
 * Only checks for session cookie presence — full token verification happens
 * in server components and API routes via firebase-admin.
 */
export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl
	const hasSession = !!request.cookies.get(SESSION_COOKIE)?.value

	const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix))
	if (isProtected && !hasSession) {
		const loginUrl = new URL('/login', request.url)
		loginUrl.searchParams.set('from', pathname)
		return NextResponse.redirect(loginUrl)
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
}
