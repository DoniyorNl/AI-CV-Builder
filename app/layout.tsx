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
		<html lang='en'>
			<body className={`${geistSans.variable} antialiased`}>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
