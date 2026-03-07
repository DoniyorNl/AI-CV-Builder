'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'

interface ErrorProps {
	error: Error & { digest?: string }
	reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
	useEffect(() => {
		// Log to an error reporting service in production
		console.error('[Dashboard error]', error)
	}, [error])

	return (
		<div className='flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4'>
			<div className='w-12 h-12 rounded-full bg-red-100 flex items-center justify-center'>
				<AlertTriangle className='w-6 h-6 text-red-600' />
			</div>
			<div>
				<h2 className='text-lg font-semibold text-gray-900'>Something went wrong</h2>
				<p className='text-sm text-gray-500 mt-1 max-w-sm'>
					An unexpected error occurred. Your data is safe — try refreshing the page.
				</p>
			</div>
			<button
				onClick={reset}
				className='flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition'
			>
				<RefreshCw className='w-4 h-4' />
				Try again
			</button>
		</div>
	)
}
