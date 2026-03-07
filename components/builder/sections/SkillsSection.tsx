'use client'

import type { SkillsContent } from '@/types/cv.types'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'

interface Props {
	data: SkillsContent
	onChange: (v: SkillsContent) => void
}

function TagInput({
	tags,
	onAdd,
	onRemove,
	placeholder,
}: {
	tags: string[]
	onAdd: (tag: string) => void
	onRemove: (i: number) => void
	placeholder: string
}) {
	const [input, setInput] = useState('')

	const add = () => {
		const trimmed = input.trim()
		if (trimmed && !tags.includes(trimmed)) {
			onAdd(trimmed)
			setInput('')
		}
	}

	return (
		<div>
			<div className='flex flex-wrap gap-2 mb-2'>
				{tags.map((tag, i) => (
					<span
						key={i}
						className='flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full'
					>
						{tag}
						<button onClick={() => onRemove(i)}>
							<X className='w-3 h-3' />
						</button>
					</span>
				))}
			</div>
			<div className='flex gap-2'>
				<input
					value={input}
					onChange={e => setInput(e.target.value)}
					onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
					className='flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
					placeholder={placeholder}
				/>
				<button
					onClick={add}
					className='p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition'
				>
					<Plus className='w-4 h-4' />
				</button>
			</div>
		</div>
	)
}

export function SkillsSection({ data, onChange }: Props) {
	return (
		<div className='space-y-6'>
			<div>
				<label className='block text-sm font-medium text-gray-700 mb-2'>Technical Skills</label>
				<p className='text-xs text-gray-400 mb-3'>Press Enter or click + to add</p>
				<TagInput
					tags={data.technical}
					placeholder='e.g. React, TypeScript, PostgreSQL'
					onAdd={tag => onChange({ ...data, technical: [...data.technical, tag] })}
					onRemove={i => onChange({ ...data, technical: data.technical.filter((_, j) => j !== i) })}
				/>
			</div>

			<div>
				<label className='block text-sm font-medium text-gray-700 mb-2'>Soft Skills</label>
				<TagInput
					tags={data.soft}
					placeholder='e.g. Leadership, Communication'
					onAdd={tag => onChange({ ...data, soft: [...data.soft, tag] })}
					onRemove={i => onChange({ ...data, soft: data.soft.filter((_, j) => j !== i) })}
				/>
			</div>
		</div>
	)
}
