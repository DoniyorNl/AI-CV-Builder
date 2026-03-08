import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	// Required for @react-pdf/renderer and firebase-admin (native Node modules)
	serverExternalPackages: ['@react-pdf/renderer', 'firebase-admin'],

	turbopack: {
		// Pin workspace root so Next.js doesn't pick up the Desktop-level lockfile
		root: __dirname,
	},

	// Security headers
	async headers() {
		const baseHeaders = [
			{ key: 'X-Content-Type-Options', value: 'nosniff' },
			{ key: 'X-Frame-Options', value: 'DENY' },
			{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
		]

		return [
			// Auth pages use signInWithPopup — Google/GitHub OAuth pages respond with
			// COOP: same-origin which causes the browser to isolate the popup into a
			// separate browsing context group.  When that happens the Firebase SDK
			// cannot check popup.closed or call popup.close(), producing the
			// "Cross-Origin-Opener-Policy policy would block the window.closed call"
			// console errors and a broken OAuth flow.  Setting unsafe-none on these
			// two pages (which contain no sensitive authenticated content) allows the
			// popup ↔ opener communication required by signInWithPopup.
			{
				source: '/login',
				headers: [...baseHeaders, { key: 'Cross-Origin-Opener-Policy', value: 'unsafe-none' }],
			},
			{
				source: '/register',
				headers: [...baseHeaders, { key: 'Cross-Origin-Opener-Policy', value: 'unsafe-none' }],
			},
			// All other pages: allow popups opened by this page to keep a reference
			// to window.opener (needed if any other OAuth flow is triggered elsewhere).
			{
				source: '/(.*)',
				headers: [
					...baseHeaders,
					{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
				],
			},
		]
	},
}

export default nextConfig
