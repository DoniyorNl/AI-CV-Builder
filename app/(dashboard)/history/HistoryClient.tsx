'use client'

import { useCVList, useDeleteCV } from '@/hooks/useCV'
import type { CV } from '@/types/cv.types'
import { Clock, Edit2, Eye, FileDown, FileText, Loader2, Plus, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const TEMPLATE_COLORS = {
	modern: 'bg-indigo-50 text-indigo-700',
	minimal: 'bg-gray-100 text-gray-700',
	classic: 'bg-amber-50 text-amber-700',
}

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})
}

export function HistoryClient() {
	const { data: cvList = [], isLoading } = useCVList()
	const deleteCV = useDeleteCV()
	const [search, setSearch] = useState('')

	const filtered = cvList.filter((cv: CV) => cv.title.toLowerCase().includes(search.toLowerCase()))

	const handleDelete = (cv: CV) => {
		if (!confirm(`"${cv.title}" ni o'chirasizmi? Bu amalni qaytarib bo'lmaydi.`)) return
		deleteCV.mutate(cv.id)
	}

	return (
		<div>
			{/* Header */}
			<div className='flex items-center justify-between mb-8'>
				<div>
					<h1 className='text-2xl font-bold text-gray-900 dark:text-white'>CV History</h1>
					<p className='text-gray-500 dark:text-slate-400 text-sm mt-1'>
						{isLoading
							? 'Loading...'
							: `${cvList.length} CV${cvList.length !== 1 ? 's' : ''} total`}
					</p>
				</div>
				<Link
					href='/builder/new'
					className='bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition flex items-center gap-2'
				>
					<Plus className='w-4 h-4' />
					New CV
				</Link>
			</div>

			{/* Search */}
			<div className='relative mb-6'>
				<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
				<input
					type='text'
					placeholder="CV nomi bo'yicha qidiring..."
					value={search}
					onChange={e => setSearch(e.target.value)}
					className='w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:text-white dark:placeholder-slate-500'
				/>
			</div>

			{/* Loading */}
			{isLoading && (
				<div className='flex items-center justify-center py-24'>
					<Loader2 className='w-6 h-6 animate-spin text-gray-400' />
				</div>
			)}

			{/* Empty state */}
			{!isLoading && filtered.length === 0 && (
				<div className='text-center py-24 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800/30'>
					<FileText className='w-12 h-12 text-gray-300 mx-auto mb-4' />
					<h3 className='text-lg font-semibold text-gray-700 dark:text-slate-300 mb-2'>
						{search ? 'Hech narsa topilmadi' : 'Hali CV yaratilmagan'}
					</h3>
					<p className='text-gray-400 dark:text-slate-500 text-sm mb-6'>
						{search
							? "Boshqa so'z bilan qidiring"
							: "Birinchi AI CV'ingizni bir necha daqiqada yarating"}
					</p>
					{!search && (
						<Link
							href='/builder/new'
							className='bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition inline-flex items-center gap-2'
						>
							<Plus className='w-4 h-4' />
							CV Yaratish
						</Link>
					)}
				</div>
			)}

			{/* Table */}
			{!isLoading && filtered.length > 0 && (
				<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden'>
					<table className='w-full'>
						<thead>
							<tr className='border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50'>
								<th className='text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide'>
									CV Nomi
								</th>
								<th className='text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide hidden sm:table-cell'>
									Template
								</th>
								<th className='text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide hidden md:table-cell'>
									Status
								</th>
								<th className='text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell'>
									Yaratilgan
								</th>
								<th className='text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell'>
									Yangilangan
								</th>
								<th className='text-right px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide'>
									Amallar
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-100 dark:divide-slate-700'>
							{filtered.map((cv: CV) => (
								<tr key={cv.id} className='hover:bg-gray-50 dark:hover:bg-slate-700/50 transition'>
									{/* Title */}
									<td className='px-6 py-4'>
										<div className='flex items-center gap-3'>
											<div className='w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0'>
												<FileText className='w-4 h-4 text-indigo-600' />
											</div>
											<span className='font-medium text-gray-900 dark:text-white text-sm truncate max-w-48'>
												{cv.title}
											</span>
										</div>
									</td>

									{/* Template */}
									<td className='px-6 py-4 hidden sm:table-cell'>
										<span
											className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
												TEMPLATE_COLORS[cv.template as keyof typeof TEMPLATE_COLORS] ??
												TEMPLATE_COLORS.modern
											}`}
										>
											{cv.template}
										</span>
									</td>

									{/* Status */}
									<td className='px-6 py-4 hidden md:table-cell'>
										<span
											className={`text-xs px-2 py-1 rounded-full ${
												cv.status === 'published'
													? 'bg-green-50 text-green-700'
													: 'bg-gray-100 text-gray-500'
											}`}
										>
											{cv.status}
										</span>
									</td>

									{/* Created at */}
									<td className='px-6 py-4 hidden lg:table-cell'>
										<span className='text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1'>
											<Clock className='w-3 h-3' />
											{formatDate(cv.created_at)}
										</span>
									</td>

									{/* Updated at */}
									<td className='px-6 py-4 hidden lg:table-cell'>
										<span className='text-sm text-gray-500 dark:text-slate-400'>
											{formatDate(cv.updated_at)}
										</span>
									</td>

									{/* Actions */}
									<td className='px-6 py-4'>
										<div className='flex items-center justify-end gap-1'>
											<Link
												href={`/builder/${cv.id}/preview`}
												className='p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition'
												title='Preview'
											>
												<Eye className='w-4 h-4' />
											</Link>
											<Link
												href={`/builder/${cv.id}/edit`}
												className='p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition'
												title='Tahrirlash'
											>
												<Edit2 className='w-4 h-4' />
											</Link>
											<a
												href={`/api/cv/export?cvId=${cv.id}`}
												target='_blank'
												rel='noopener noreferrer'
												className='p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition'
												title='PDF yuklab olish'
											>
												<FileDown className='w-4 h-4' />
											</a>
											<button
												onClick={() => handleDelete(cv)}
												disabled={deleteCV.isPending}
												className='p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition disabled:opacity-50'
												title='Delete'
											>
												<Trash2 className='w-4 h-4' />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{/* Footer */}
					<div className='px-6 py-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50'>
						<p className='text-xs text-gray-400 dark:text-slate-500'>
							{filtered.length} ta natija ko&#39;rsatilmoqda
							{search && ` "${search}" uchun`}
						</p>
					</div>
				</div>
			)}
		</div>
	)
}
