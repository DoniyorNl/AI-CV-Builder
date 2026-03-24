'use client'

import { VoiceMicButton } from '@/components/ui/VoiceMicButton'
import { generateId } from '@/lib/utils'
import type { ExperienceItem } from '@/types/cv.types'
import { ChevronDown, ChevronUp, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props {
	data: ExperienceItem[]
	onChange: (v: ExperienceItem[]) => void
}

function ExperienceCard({
	item,
	onUpdate,
	onDelete,
}: {
	item: ExperienceItem
	onUpdate: (updated: ExperienceItem) => void
	onDelete: () => void
}) {
	const [open, setOpen] = useState(true)
	const [generating, setGenerating] = useState(false)

	const set = (key: keyof ExperienceItem, value: unknown) => onUpdate({ ...item, [key]: value })

	const handleGenerateBullets = async () => {
		if (!item.raw_description?.trim() && !item.bullets.length) {
			toast.error('Add a raw description or existing bullets first.')
			return
		}
		setGenerating(true)
		try {
			const res = await fetch('/api/cv/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ section: 'experience', content: [item] }),
			})
			if (!res.ok) throw new Error()
			const { bullets } = (await res.json()) as { bullets: string[] }
			onUpdate({ ...item, bullets })
			toast.success('Bullet points improved!')
		} catch {
			toast.error('AI generation failed.')
		} finally {
			setGenerating(false)
		}
	}

	return (
		<div className='border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden'>
			{/* Header */}
			<div className='flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-800/60'>
				<button
					className='flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-200'
					onClick={() => setOpen(!open)}
				>
					{open ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />}
					{item.position || 'New Position'} at {item.company || 'Company'}
				</button>
				<button
					onClick={onDelete}
					className='p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition'
				>
					<Trash2 className='w-3.5 h-3.5' />
				</button>
			</div>

			{open && (
				<div className='p-4 space-y-4'>
					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1'>
								Company
							</label>
							<div className='relative'>
								<input
									value={item.company}
									onChange={e => set('company', e.target.value)}
									className='w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 pr-9 text-sm dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500'
									placeholder='Google'
								/>
								<VoiceMicButton
									value={item.company}
									onChange={v => set('company', v)}
									className='absolute right-1.5 top-1/2 -translate-y-1/2'
								/>
							</div>
						</div>
						<div>
							<label className='block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1'>
								Position
							</label>
							<div className='relative'>
								<input
									value={item.position}
									onChange={e => set('position', e.target.value)}
									className='w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 pr-9 text-sm dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500'
									placeholder='Senior Engineer'
								/>
								<VoiceMicButton
									value={item.position}
									onChange={v => set('position', v)}
									className='absolute right-1.5 top-1/2 -translate-y-1/2'
								/>
							</div>
						</div>
						<div>
							<label className='block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1'>
								Start Date
							</label>
							<input
								type='month'
								value={item.start_date}
								onChange={e => set('start_date', e.target.value)}
								className='w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
							/>
						</div>
						<div>
							<label className='block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1'>
								End Date
							</label>
							<input
								type='month'
								value={item.end_date}
								onChange={e => set('end_date', e.target.value)}
								disabled={item.current}
								className='w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 dark:disabled:bg-slate-700/50 disabled:text-gray-400 dark:disabled:text-slate-500'
							/>
						</div>
					</div>

					<div className='flex items-center gap-2'>
						<input
							type='checkbox'
							id={`current-${item.id}`}
							checked={item.current}
							onChange={e => set('current', e.target.checked)}
							className='rounded'
						/>
						<label
							htmlFor={`current-${item.id}`}
							className='text-sm text-gray-600 dark:text-slate-400'
						>
							I currently work here
						</label>
					</div>

					{/* Raw description + AI */}
					<div>
						<div className='flex items-center justify-between mb-1'>
							<label className='block text-xs font-medium text-gray-600 dark:text-slate-400'>
								Job Description (raw — AI will convert to bullets)
							</label>
							<button
								onClick={handleGenerateBullets}
								disabled={generating}
								className='flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg px-2.5 py-1 text-xs font-medium transition'
							>
								{generating ? (
									<Loader2 className='w-3 h-3 animate-spin' />
								) : (
									<Sparkles className='w-3 h-3' />
								)}
								AI Bullets
							</button>
						</div>
						<div className='relative'>
							<textarea
								value={item.raw_description ?? ''}
								onChange={e => set('raw_description', e.target.value)}
								rows={3}
								className='w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 pr-9 text-sm dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none'
								placeholder='Describe what you did in this role...'
							/>
							<VoiceMicButton
								value={item.raw_description ?? ''}
								onChange={v => set('raw_description', v)}
								className='absolute right-1.5 top-2'
							/>
						</div>
					</div>

					{/* Generated bullets */}
					{item.bullets.length > 0 && (
						<div>
							<label className='block text-xs font-medium text-gray-600 dark:text-slate-400 mb-2'>
								Generated Bullets
							</label>
							<ul className='space-y-1.5'>
								{item.bullets.map((bullet, i) => (
									<li key={i} className='flex items-start gap-2'>
										<span className='text-indigo-500 mt-0.5'>•</span>
										<input
											value={bullet}
											onChange={e => {
												const updated = [...item.bullets]
												updated[i] = e.target.value
												set('bullets', updated)
											}}
											className='flex-1 border border-gray-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-sm dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
										/>
										<button
											onClick={() =>
												set(
													'bullets',
													item.bullets.filter((_, j) => j !== i),
												)
											}
											className='p-1 text-gray-300 hover:text-red-400'
										>
											<Trash2 className='w-3.5 h-3.5' />
										</button>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export function ExperienceSection({ data, onChange }: Props) {
	const addItem = () => {
		onChange([
			...data,
			{
				id: generateId(),
				company: '',
				position: '',
				start_date: '',
				end_date: '',
				current: false,
				bullets: [],
				raw_description: '',
			},
		])
	}

	return (
		<div className='space-y-4'>
			{data.map((item, i) => (
				<ExperienceCard
					key={item.id}
					item={item}
					onUpdate={updated => {
						const next = [...data]
						next[i] = updated
						onChange(next)
					}}
					onDelete={() => onChange(data.filter((_, j) => j !== i))}
				/>
			))}

			<button
				onClick={addItem}
				className='w-full border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl py-3 text-sm text-gray-400 dark:text-slate-500 hover:border-indigo-300 hover:text-indigo-500 transition flex items-center justify-center gap-2'
			>
				<Plus className='w-4 h-4' />
				Add Experience
			</button>
		</div>
	)
}
