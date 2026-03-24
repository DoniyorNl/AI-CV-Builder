'use client'

import { generateId } from '@/lib/utils'
import type { EducationItem } from '@/types/cv.types'
import { VoiceMicButton } from '@/components/ui/VoiceMicButton'
import { Plus, Trash2 } from 'lucide-react'

interface Props {
	data: EducationItem[]
	onChange: (v: EducationItem[]) => void
}

export function EducationSection({ data, onChange }: Props) {
	const update = (i: number, key: keyof EducationItem, value: string) => {
		const next = [...data]
		next[i] = { ...next[i], [key]: value }
		onChange(next)
	}

	const add = () =>
		onChange([
			...data,
			{ id: generateId(), institution: '', degree: '', field: '', start_year: '', end_year: '' },
		])

	return (
		<div className='space-y-4'>
			{data.map((item, i) => (
				<div
					key={item.id}
					className='border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-3'
				>
					<div className='flex justify-end'>
						<button
							onClick={() => onChange(data.filter((_, j) => j !== i))}
							className='p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition'
						>
							<Trash2 className='w-3.5 h-3.5' />
						</button>
					</div>
					<div className='grid grid-cols-2 gap-3'>
						<div className='col-span-2'>
							<label className='block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1'>
								Institution
							</label>
							<div className='relative'>
								<input
									value={item.institution}
									onChange={e => update(i, 'institution', e.target.value)}
									className='w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 pr-9 text-sm dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500'
									placeholder='MIT'
								/>
								<VoiceMicButton
									value={item.institution}
									onChange={v => update(i, 'institution', v)}
									className='absolute right-1.5 top-1/2 -translate-y-1/2'
								/>
							</div>
						</div>
						<div>
							<label className='block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1'>
								Degree
							</label>
							<div className='relative'>
								<input
									value={item.degree}
									onChange={e => update(i, 'degree', e.target.value)}
									className='w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 pr-9 text-sm dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500'
									placeholder="Bachelor's"
								/>
								<VoiceMicButton
									value={item.degree}
									onChange={v => update(i, 'degree', v)}
									className='absolute right-1.5 top-1/2 -translate-y-1/2'
								/>
							</div>
						</div>
						<div>
							<label className='block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1'>
								Field of Study
							</label>
							<div className='relative'>
								<input
									value={item.field}
									onChange={e => update(i, 'field', e.target.value)}
									className='w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 pr-9 text-sm dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500'
									placeholder='Computer Science'
								/>
								<VoiceMicButton
									value={item.field}
									onChange={v => update(i, 'field', v)}
									className='absolute right-1.5 top-1/2 -translate-y-1/2'
								/>
							</div>
						</div>
						<div>
							<label className='block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1'>
								Start Year
							</label>
							<input
								type='number'
								value={item.start_year}
								onChange={e => update(i, 'start_year', e.target.value)}
								className='w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500'
								placeholder='2018'
							/>
						</div>
						<div>
							<label className='block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1'>
								End Year
							</label>
							<input
								type='number'
								value={item.end_year}
								onChange={e => update(i, 'end_year', e.target.value)}
								className='w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500'
								placeholder='2022'
							/>
						</div>
					</div>
				</div>
			))}

			<button
				onClick={add}
				className='w-full border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl py-3 text-sm text-gray-400 dark:text-slate-500 hover:border-indigo-300 hover:text-indigo-500 transition flex items-center justify-center gap-2'
			>
				<Plus className='w-4 h-4' />
				Add Education
			</button>
		</div>
	)
}
