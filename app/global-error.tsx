'use client'

import { RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

const isDev = process.env.NODE_ENV === 'development'

interface GlobalErrorProps {
	error: Error & { digest?: string }
	reset: () => void
}

/**
 * Rendered when the root layout itself throws — replaces the entire page.
 * Must have its own <html> and <body> tags.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
	useEffect(() => {
		console.error('[Global error]', error)
	}, [error])

	return (
		<html lang='en'>
			<body className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
				<div className='text-center space-y-4 max-w-md'>
					<h1 className='text-2xl font-bold text-gray-900'>Something went wrong</h1>
					<p className='text-gray-500 text-sm'>
						An unexpected error occurred. Try refreshing the page or going back to the home page.
					</p>
					{isDev && (
						<pre className='text-left text-xs bg-gray-100 p-3 rounded-lg overflow-auto max-h-32 text-red-700'>
							{error.message}
						</pre>
					)}
					{!isDev && error.digest && (
						<p className='text-gray-400 text-xs'>Error ID: {error.digest}</p>
					)}
					<div className='flex flex-wrap gap-3 justify-center'>
						<button
							onClick={reset}
							className='inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition'
						>
							<RefreshCw className='w-4 h-4' />
							Try again
						</button>
						<Link
							href='/'
							className='inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium transition'
						>
							Go home
						</Link>
					</div>
				</div>
			</body>
		</html>
	)
}
