import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	// Required for @react-pdf/renderer — it uses Canvas internally
	serverExternalPackages: ['@react-pdf/renderer'],

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
