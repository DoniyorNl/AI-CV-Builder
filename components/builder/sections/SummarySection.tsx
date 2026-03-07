'use client'

import type { CVData, SummaryContent } from '@/types/cv.types'
import { Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props {
	data: SummaryContent
	context: Partial<CVData>
	onChange: (v: SummaryContent) => void
}

export function SummarySection({ data, context, onChange }: Props) {
	const [generating, setGenerating] = useState(false)

	const handleGenerate = async () => {
		if (!data.text.trim()) {
			toast.error('Write a short description first, then let AI improve it.')
			return
		}
		setGenerating(true)
		try {
			const res = await fetch('/api/cv/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ section: 'summary', content: data, context }),
			})
			if (!res.ok) throw new Error('Generation failed')
			const { summary } = (await res.json()) as { summary: string }
			onChange({ text: summary })
			toast.success('Summary improved by AI!')
		} catch {
			toast.error('AI generation failed. Please try again.')
		} finally {
			setGenerating(false)
		}
	}

	return (
		<div className='space-y-3'>
			<div className='flex items-center justify-between'>
				<p className='text-sm text-gray-500'>
					Write a rough description — AI will polish it into a professional summary.
				</p>
				<button
					onClick={handleGenerate}
					disabled={generating}
					className='flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-60'
				>
					{generating ? (
						<Loader2 className='w-3.5 h-3.5 animate-spin' />
					) : (
						<Sparkles className='w-3.5 h-3.5' />
					)}
					AI Improve
				</button>
			</div>

			<textarea
				value={data.text}
				onChange={e => onChange({ text: e.target.value })}
				rows={8}
				className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none'
				placeholder='e.g. 5 years of React experience, built SaaS products, led a team of 3 developers...'
			/>

			<p className='text-xs text-gray-400'>{data.text.length} characters</p>
		</div>
	)
}
