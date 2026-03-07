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
				],
			},
		]
	},
}

export default nextConfig
