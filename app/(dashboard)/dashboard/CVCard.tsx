'use client'

import { useDeleteCV } from '@/hooks/useCV'
import type { CV } from '@/types/cv.types'
import { Clock, Edit2, Eye, Layout, Trash2 } from 'lucide-react'
import Link from 'next/link'

const TEMPLATE_COLORS = {
	modern: 'bg-indigo-50 text-indigo-700',
	minimal: 'bg-gray-100 text-gray-700',
	classic: 'bg-amber-50 text-amber-700',
}

export function CVCard({ cv }: { cv: CV }) {
	const deleteCV = useDeleteCV()

	const handleDelete = () => {
		if (!confirm('Delete this CV? This cannot be undone.')) return
		deleteCV.mutate(cv.id)
	}

	const updatedAt = new Date(cv.updated_at).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})

	return (
		<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition group'>
			{/* Template badge & title */}
			<div className='flex items-start justify-between mb-3'>
				<div>
					<h3 className='font-semibold text-gray-900 dark:text-white truncate max-w-45'>
						{cv.title}
					</h3>
					<div className='flex items-center gap-2 mt-1'>
						<span
							className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
								TEMPLATE_COLORS[cv.template as keyof typeof TEMPLATE_COLORS] ??
								TEMPLATE_COLORS.modern
							}`}
						>
							<Layout className='w-3 h-3 inline mr-1' />
							{cv.template}
						</span>
						<span
							className={`text-xs px-2 py-0.5 rounded-full ${
								cv.status === 'published'
									? 'bg-green-50 text-green-700'
									: 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
							}`}
						>
							{cv.status}
						</span>
					</div>
				</div>
			</div>

			{/* Updated at */}
			<p className='text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1 mb-4'>
				<Clock className='w-3 h-3' />
				Updated {updatedAt}
			</p>

			{/* Actions */}
			<div className='flex items-center gap-2'>
				<Link
					href={`/builder/${cv.id}/edit`}
					className='flex-1 flex items-center justify-center gap-1.5 border border-gray-200 dark:border-slate-600 rounded-lg py-2 text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition'
				>
					<Edit2 className='w-3.5 h-3.5' />
					Edit
				</Link>
				<Link
					href={`/builder/${cv.id}/preview`}
					className='flex-1 flex items-center justify-center gap-1.5 border border-gray-200 dark:border-slate-600 rounded-lg py-2 text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition'
				>
					<Eye className='w-3.5 h-3.5' />
					Preview
				</Link>
				<button
					onClick={handleDelete}
					disabled={deleteCV.isPending}
					className='p-2 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:border-red-800 transition'
				>
					<Trash2 className='w-3.5 h-3.5' />
				</button>
			</div>
		</div>
	)
}
