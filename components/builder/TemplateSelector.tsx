'use client'

import { cn } from '@/lib/utils'
import type { Template } from '@/types/cv.types'
import { Check } from 'lucide-react'

const TEMPLATES: {
	id: Template
	name: string
	description: string
	preview: string
}[] = [
	{
		id: 'modern',
		name: 'Modern',
		description: 'Colorful header, two-column layout',
		preview: 'bg-gradient-to-br from-indigo-500 to-purple-500',
	},
	{
		id: 'minimal',
		name: 'Minimal',
		description: 'Clean, typography-focused design',
		preview: 'bg-gradient-to-br from-gray-700 to-gray-900',
	},
	{
		id: 'classic',
		name: 'Classic',
		description: 'Traditional, ATS-friendly format',
		preview: 'bg-gradient-to-br from-amber-600 to-orange-600',
	},
]

interface Props {
	selected: Template
	onSelect: (t: Template) => void
}

export function TemplateSelector({ selected, onSelect }: Props) {
	return (
		<div className='grid grid-cols-3 gap-3'>
			{TEMPLATES.map(t => (
				<button
					key={t.id}
					onClick={() => onSelect(t.id)}
					className={cn(
						'relative border-2 rounded-xl p-3 text-left transition',
						selected === t.id
							? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
							: 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800',
					)}
				>
					{/* Mini preview */}
					<div className={`h-16 rounded-lg mb-3 ${t.preview} relative overflow-hidden`}>
						{/* Fake CV lines */}
						<div className='absolute bottom-2 left-2 right-2 space-y-1'>
							<div className='h-1.5 bg-white/40 rounded-full w-3/4' />
							<div className='h-1 bg-white/30 rounded-full w-1/2' />
							<div className='h-1 bg-white/30 rounded-full w-2/3' />
						</div>
					</div>

					<p className='font-medium text-sm text-gray-900 dark:text-white'>{t.name}</p>
					<p className='text-xs text-gray-400 dark:text-slate-500 mt-0.5'>{t.description}</p>

					{selected === t.id && (
						<div className='absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center'>
							<Check className='w-3 h-3 text-white' />
						</div>
					)}
				</button>
			))}
		</div>
	)
}
