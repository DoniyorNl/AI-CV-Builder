import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'AI CV Builder — Create Professional CVs in Minutes',
	description: 'Build AI-powered CVs with professional templates. Export to PDF instantly.',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<head>
				{/* Anti-flash: resolve theme before React hydrates to prevent white flash */}
				<script
					dangerouslySetInnerHTML={{
						__html: `try{const t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.classList.toggle('dark',t==='dark')}catch{}`,
					}}
				/>
			</head>
			<body className={`${geistSans.variable} antialiased`}>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
