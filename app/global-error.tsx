'use client'

import { RefreshCw } from 'lucide-react'
import { useEffect } from 'react'

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
				<div className='text-center space-y-4'>
					<h1 className='text-2xl font-bold text-gray-900'>Something went wrong</h1>
					<p className='text-gray-500 max-w-sm text-sm'>
						A critical error occurred. We've been notified and are looking into it.
					</p>
					<button
						onClick={reset}
						className='inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition'
					>
						<RefreshCw className='w-4 h-4' />
						Try again
					</button>
				</div>
			</body>
		</html>
	)
}
