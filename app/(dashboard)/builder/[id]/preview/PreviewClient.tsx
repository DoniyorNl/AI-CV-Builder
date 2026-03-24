'use client'

import { CVPreviewPanel } from '@/components/builder/CVPreviewPanel'
import { TemplateSelector } from '@/components/builder/TemplateSelector'
import { sectionsToCVData } from '@/hooks/useCV'
import { useSubscription } from '@/hooks/useSubscription'
import { db } from '@/lib/firebase/client'
import type { CV, CVSection, Template } from '@/types/cv.types'
import { doc, updateDoc } from 'firebase/firestore'
import { Download, Edit2, Loader2, Lock } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props {
	cv: CV
	sections: CVSection[]
}

export function PreviewClient({ cv, sections }: Props) {
	const [template, setTemplate] = useState<Template>(cv.template as Template)
	const [downloading, setDownloading] = useState(false)
	const { data: sub } = useSubscription()

	const cvData = sectionsToCVData(sections)

	const handleTemplateChange = async (t: Template) => {
		setTemplate(t)
		await updateDoc(doc(db, 'cvs', cv.id), { template: t })
	}

	const handleDownload = async () => {
		if (!sub?.isPro) {
			toast.error('Upgrade to Pro to download PDF')
			return
		}
		setDownloading(true)
		try {
			const res = await fetch(`/api/cv/export?id=${cv.id}&template=${template}`)
			if (res.status === 402) {
				toast.error('PDF download requires Pro plan')
				return
			}
			if (!res.ok) throw new Error('Export failed')
			const blob = await res.blob()
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `${cv.title.replace(/\s+/g, '-')}.pdf`
			a.click()
			URL.revokeObjectURL(url)
			toast.success('PDF downloaded!')
		} catch {
			toast.error('Failed to download PDF.')
		} finally {
			setDownloading(false)
		}
	}

	return (
		<div className='flex gap-6 min-h-[calc(100vh-8rem)]'>
			{/* Left panel — controls */}
			<aside className='w-64 shrink-0'>
				<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 sticky top-24 space-y-6'>
					<div>
						<h3 className='font-semibold text-gray-900 dark:text-white mb-3'>Template</h3>
						<TemplateSelector selected={template} onSelect={handleTemplateChange} />
					</div>

					<div className='space-y-2 pt-4 border-t border-gray-100 dark:border-slate-700'>
						{/* Download PDF */}
						{sub?.isPro ? (
							<button
								onClick={handleDownload}
								disabled={downloading}
								className='w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-sm font-medium transition disabled:opacity-60'
							>
								{downloading ? (
									<Loader2 className='w-4 h-4 animate-spin' />
								) : (
									<Download className='w-4 h-4' />
								)}
								Download PDF
							</button>
						) : (
							<Link
								href='/billing'
								className='w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-sm font-medium transition'
							>
								<Lock className='w-4 h-4' />
								Unlock PDF — Pro
							</Link>
						)}

						<Link
							href={`/builder/${cv.id}/edit`}
							className='w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl py-2.5 text-sm font-medium transition'
						>
							<Edit2 className='w-4 h-4' />
							Edit CV
						</Link>
					</div>
				</div>
			</aside>

			{/* Preview */}
			<div className='flex-1 min-w-0'>
				<CVPreviewPanel data={cvData} template={template} />
			</div>
		</div>
	)
}
