import { FileSearch } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
	return (
		<div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
			<div className='text-center space-y-4'>
				<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100'>
					<FileSearch className='w-8 h-8 text-indigo-600' />
				</div>
				<h1 className='text-3xl font-bold text-gray-900'>Page not found</h1>
				<p className='text-gray-500 max-w-sm'>
					The page you&#39;re looking for doesn&#39;t exist or has been moved.
				</p>
				<Link
					href='/dashboard'
					className='inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition'
				>
					Back to Dashboard
				</Link>
			</div>
		</div>
	)
}
