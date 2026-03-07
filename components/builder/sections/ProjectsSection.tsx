'use client'

import { generateId } from '@/lib/utils'
import type { ProjectItem } from '@/types/cv.types'
import { Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'

interface Props {
	data: ProjectItem[]
	onChange: (v: ProjectItem[]) => void
}

export function ProjectsSection({ data, onChange }: Props) {
	const [techInputs, setTechInputs] = useState<Record<string, string>>({})

	const update = (i: number, key: keyof ProjectItem, value: unknown) => {
		const next = [...data]
		next[i] = { ...next[i], [key]: value }
		onChange(next)
	}

	const addTech = (itemId: string, i: number) => {
		const tag = (techInputs[itemId] ?? '').trim()
		if (!tag) return
		const item = data[i]
		if (!item.technologies.includes(tag)) {
			update(i, 'technologies', [...item.technologies, tag])
		}
		setTechInputs(prev => ({ ...prev, [itemId]: '' }))
	}

	const removeTech = (i: number, ti: number) => {
		update(
			i,
			'technologies',
			data[i].technologies.filter((_, j) => j !== ti),
		)
	}

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
						<div>
							<label className='block text-xs font-medium text-gray-600 mb-1'>Project Name</label>
							<input
								value={item.name}
								onChange={e => update(i, 'name', e.target.value)}
								className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
								placeholder='My Awesome Project'
							/>
						</div>
						<div>
							<label className='block text-xs font-medium text-gray-600 mb-1'>
								Link (optional)
							</label>
							<input
								value={item.link ?? ''}
								onChange={e => update(i, 'link', e.target.value)}
								className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
								placeholder='github.com/user/project'
							/>
						</div>
					</div>

					<div>
						<label className='block text-xs font-medium text-gray-600 mb-1'>Description</label>
						<textarea
							value={item.description}
							onChange={e => update(i, 'description', e.target.value)}
							rows={2}
							className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none'
							placeholder='What does this project do?'
						/>
					</div>

					<div>
						<label className='block text-xs font-medium text-gray-600 mb-2'>Technologies</label>
						<div className='flex flex-wrap gap-1.5 mb-2'>
							{item.technologies.map((t, ti) => (
								<span
									key={ti}
									className='flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full'
								>
									{t}
									<button onClick={() => removeTech(i, ti)}>
										<X className='w-3 h-3' />
									</button>
								</span>
							))}
						</div>
						<div className='flex gap-2'>
							<input
								value={techInputs[item.id] ?? ''}
								onChange={e => setTechInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
								onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech(item.id, i))}
								className='flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
								placeholder='React, Node.js…'
							/>
							<button
								onClick={() => addTech(item.id, i)}
								className='p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg'
							>
								<Plus className='w-4 h-4' />
							</button>
						</div>
					</div>
				</div>
			))}

			<button
				onClick={() =>
					onChange([
						...data,
						{ id: generateId(), name: '', link: '', description: '', technologies: [] },
					])
				}
				className='w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition flex items-center justify-center gap-2'
			>
				<Plus className='w-4 h-4' />
				Add Project
			</button>
		</div>
	)
}
