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
		return [
			{
				source: '/(.*)',
				headers: [
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'X-Frame-Options', value: 'DENY' },
					{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
					// Required for Firebase/Google/GitHub OAuth popup — allows popup to communicate with opener
					{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
				],
			},
		]
	},
}

export default nextConfig
