import { NextResponse } from 'next/server'

// Firebase uses client-side popups for OAuth — no server callback needed.
// This route exists only as a fallback redirect.
export function GET(request: Request) {
	const origin = new URL(request.url).origin
	return NextResponse.redirect(`${origin}/dashboard`)
}
