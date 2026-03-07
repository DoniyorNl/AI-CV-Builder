'use client'

import { generateId } from '@/lib/utils'
import type { EducationItem } from '@/types/cv.types'
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
				<div key={item.id} className='border border-gray-200 rounded-xl p-4 space-y-3'>
					<div className='flex justify-end'>
						<button
							onClick={() => onChange(data.filter((_, j) => j !== i))}
							className='p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition'
						>
							<Trash2 className='w-3.5 h-3.5' />
						</button>
					</div>
					<div className='grid grid-cols-2 gap-3'>
						<div className='col-span-2'>
							<label className='block text-xs font-medium text-gray-600 mb-1'>Institution</label>
							<input
								value={item.institution}
								onChange={e => update(i, 'institution', e.target.value)}
								className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
								placeholder='MIT'
							/>
						</div>
						<div>
							<label className='block text-xs font-medium text-gray-600 mb-1'>Degree</label>
							<input
								value={item.degree}
								onChange={e => update(i, 'degree', e.target.value)}
								className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
								placeholder="Bachelor's"
							/>
						</div>
						<div>
							<label className='block text-xs font-medium text-gray-600 mb-1'>Field of Study</label>
							<input
								value={item.field}
								onChange={e => update(i, 'field', e.target.value)}
								className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
								placeholder='Computer Science'
							/>
						</div>
						<div>
							<label className='block text-xs font-medium text-gray-600 mb-1'>Start Year</label>
							<input
								type='number'
								value={item.start_year}
								onChange={e => update(i, 'start_year', e.target.value)}
								className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
								placeholder='2018'
							/>
						</div>
						<div>
							<label className='block text-xs font-medium text-gray-600 mb-1'>End Year</label>
							<input
								type='number'
								value={item.end_year}
								onChange={e => update(i, 'end_year', e.target.value)}
								className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
								placeholder='2022'
							/>
						</div>
					</div>
				</div>
			))}

			<button
				onClick={add}
				className='w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition flex items-center justify-center gap-2'
			>
				<Plus className='w-4 h-4' />
				Add Education
			</button>
		</div>
	)
}
