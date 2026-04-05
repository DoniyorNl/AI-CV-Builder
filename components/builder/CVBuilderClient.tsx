'use client'

import { useAutoSave } from '@/hooks/useAutoSave'
import { sectionsToCVData, useUpdateCV, useUpdateSection } from '@/hooks/useCV'
import { cn } from '@/lib/utils'
import type { CV, CVData, CVSection, SectionType, Template } from '@/types/cv.types'
import {
	AlignLeft,
	Briefcase,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Download,
	Eye,
	EyeOff,
	FolderGit2,
	GraduationCap,
	LayoutTemplate,
	Loader2,
	User,
	Wrench,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { CVPreviewPanel } from './CVPreviewPanel'
import { EducationSection } from './sections/EducationSection'
import { ExperienceSection } from './sections/ExperienceSection'
import { PersonalSection } from './sections/PersonalSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { SkillsSection } from './sections/SkillsSection'
import { SummarySection } from './sections/SummarySection'

const SECTIONS: { type: SectionType; label: string; icon: React.ElementType }[] = [
	{ type: 'personal', label: 'Personal Info', icon: User },
	{ type: 'summary', label: 'Summary', icon: AlignLeft },
	{ type: 'experience', label: 'Experience', icon: Briefcase },
	{ type: 'education', label: 'Education', icon: GraduationCap },
	{ type: 'skills', label: 'Skills', icon: Wrench },
	{ type: 'projects', label: 'Projects', icon: FolderGit2 },
]

const TEMPLATES: { id: Template; label: string }[] = [
	{ id: 'modern', label: 'Modern' },
	{ id: 'classic', label: 'Classic' },
	{ id: 'minimal', label: 'Minimal' },
]

interface Props {
	cv: CV
	sections: CVSection[]
}

type SaveStatus = 'idle' | 'saving' | 'saved'

export function CVBuilderClient({ cv, sections }: Props) {
	const [activeSection, setActiveSection] = useState<SectionType>('personal')
	const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
	const [cvData, setCvData] = useState<CVData>(() => sectionsToCVData(sections))
	const [showPreview, setShowPreview] = useState(true)
	const [liveTemplate, setLiveTemplate] = useState<Template>(cv.template)
	const [downloading, setDownloading] = useState(false)

	const { mutateAsync: updateSection } = useUpdateSection(cv.id)
	const { mutate: updateCVMeta } = useUpdateCV(cv.id)

	const handleTemplateChange = (template: Template) => {
		setLiveTemplate(template)
		updateCVMeta({ template })
	}

	const getSectionId = (type: SectionType) => sections.find(s => s.type === type)?.id ?? ''

	const handleSectionChange = useCallback(
		async (type: SectionType, content: object) => {
			const sectionId = getSectionId(type)
			if (!sectionId) return
			await updateSection({ sectionId, content })
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[sections],
	)

	const { flush } = useAutoSave(
		cvData,
		async data => {
			// Save all sections on change
			const promises = SECTIONS.map(({ type }) => handleSectionChange(type, data[type] as object))
			await Promise.all(promises)
		},
		{
			delay: 1000,
			onSaving: () => setSaveStatus('saving'),
			onSaved: () => {
				setSaveStatus('saved')
				setTimeout(() => setSaveStatus('idle'), 2000)
			},
			onError: err => {
				setSaveStatus('idle')
				console.error('[CVBuilderClient] Auto-save failed:', err)
				toast.error('Auto-save failed — check your Firebase/Firestore configuration.')
			},
		},
	)

	const handleDownload = async () => {
		setDownloading(true)
		try {
			// Avval pending o'zgarishlarni saqlash
			await flush()
			// Server tarafda save bo'lishi uchun biroz kutish
			await new Promise(r => setTimeout(r, 600))

			const res = await fetch(`/api/cv/export?id=${cv.id}&template=${liveTemplate}`)
			if (!res.ok) {
				const data = await res.json().catch(() => ({}))
				throw new Error((data as { error?: string }).error ?? 'Export failed')
			}
			const blob = await res.blob()
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `${cv.title.replace(/\s+/g, '-')}.pdf`
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			URL.revokeObjectURL(url)
			toast.success('PDF muvaffaqiyatli yuklandi!')
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Noma\'lum xato'
			toast.error(`PDF yuklab bo'lmadi: ${msg}`)
		} finally {
			setDownloading(false)
		}
	}

	const updateData = <K extends keyof CVData>(key: K, value: CVData[K]) => {
		setCvData(prev => ({ ...prev, [key]: value }))
	}

	return (
		<div className='flex gap-4 min-h-[calc(100vh-8rem)]'>
			{/* Sidebar nav */}
			<aside className='w-52 shrink-0'>
				<div className='bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-3 sticky top-24'>
					<nav className='space-y-1'>
						{SECTIONS.map(({ type, label, icon: Icon }) => (
							<button
								key={type}
								onClick={() => setActiveSection(type)}
								className={cn(
									'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition',
									activeSection === type
										? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
										: 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800',
								)}
							>
								<Icon className='w-4 h-4 shrink-0' />
								{label}
							</button>
						))}
					</nav>

					<div className='mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 space-y-2'>
						{/* Save status */}
						<div className='flex items-center gap-1.5 px-3 py-1 text-xs text-gray-400'>
							{saveStatus === 'saving' && (
								<>
									<Loader2 className='w-3 h-3 animate-spin' />
									Saving…
								</>
							)}
							{saveStatus === 'saved' && (
								<>
									<CheckCircle2 className='w-3 h-3 text-green-500' />
									Saved
								</>
							)}
							{saveStatus === 'idle' && (
								<>
									<CheckCircle2 className='w-3 h-3 text-gray-300' />
									Auto-save on
								</>
							)}
						</div>

					{/* Save & Download PDF */}
					<button
						onClick={handleDownload}
						disabled={downloading || saveStatus === 'saving'}
						className='w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-medium transition'
					>
						{downloading ? (
							<>
								<Loader2 className='w-4 h-4 animate-spin' />
								Yuklanmoqda…
							</>
						) : (
							<>
								<Download className='w-4 h-4' />
								Save & Download PDF
							</>
						)}
					</button>

					<Link
						href={`/builder/${cv.id}/preview`}
						onClick={() => flush()}
						className='w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-sm font-medium transition'
					>
						<Eye className='w-4 h-4' />
						Full Preview
					</Link>
					<button
						onClick={() => setShowPreview(v => !v)}
						className='hidden lg:flex w-full items-center justify-center gap-2 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-xl py-2 text-sm font-medium transition'
					>
						{showPreview ? (
							<EyeOff className='w-4 h-4' />
						) : (
							<LayoutTemplate className='w-4 h-4' />
						)}
						{showPreview ? 'Hide Preview' : 'Show Preview'}
					</button>
					</div>
				</div>
			</aside>

			{/* Active section form */}
			<div className='flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 min-w-0 flex flex-col'>
				<h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-6'>
					{SECTIONS.find(s => s.type === activeSection)?.label}
				</h2>

				<div className='flex-1'>
					{activeSection === 'personal' && (
						<PersonalSection data={cvData.personal} onChange={v => updateData('personal', v)} />
					)}
					{activeSection === 'summary' && (
						<SummarySection
							data={cvData.summary}
							context={cvData}
							onChange={v => updateData('summary', v)}
						/>
					)}
					{activeSection === 'experience' && (
						<ExperienceSection
							data={cvData.experience}
							onChange={v => updateData('experience', v)}
						/>
					)}
					{activeSection === 'education' && (
						<EducationSection data={cvData.education} onChange={v => updateData('education', v)} />
					)}
					{activeSection === 'skills' && (
						<SkillsSection data={cvData.skills} onChange={v => updateData('skills', v)} />
					)}
					{activeSection === 'projects' && (
						<ProjectsSection data={cvData.projects} onChange={v => updateData('projects', v)} />
					)}
				</div>

				{/* Prev / Next navigation */}
				{(() => {
					const currentIndex = SECTIONS.findIndex(s => s.type === activeSection)
					const prev = SECTIONS[currentIndex - 1]
					const next = SECTIONS[currentIndex + 1]
					return (
						<div className='flex items-center justify-between pt-6 mt-6 border-t border-gray-100 dark:border-slate-700'>
							<button
								onClick={() => prev && setActiveSection(prev.type)}
								disabled={!prev}
								className={cn(
									'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition',
									prev
										? 'text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
										: 'invisible',
								)}
							>
								<ChevronLeft className='w-4 h-4' />
								{prev?.label}
							</button>

							<span className='text-xs text-gray-400 dark:text-slate-500'>
								{currentIndex + 1} / {SECTIONS.length}
							</span>

							<button
								onClick={() => next && setActiveSection(next.type)}
								disabled={!next}
								className={cn(
									'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition',
									next ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'invisible',
								)}
							>
								{next?.label}
								<ChevronRight className='w-4 h-4' />
							</button>
						</div>
					)
				})()}
			</div>

			{/* Live Preview Panel */}
			{showPreview && (
				<aside className='w-80 xl:w-96 shrink-0 hidden lg:flex flex-col gap-3'>
					<div className='sticky top-24 flex flex-col gap-3'>
						{/* Template switcher */}
						<div className='bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-3'>
							<div className='flex items-center gap-1.5 mb-2.5 px-1'>
								<LayoutTemplate className='w-3.5 h-3.5 text-gray-400 dark:text-slate-500' />
								<span className='text-xs font-medium text-gray-500 dark:text-slate-400'>
									Template
								</span>
							</div>
							<div className='flex gap-1.5'>
								{TEMPLATES.map(t => (
									<button
										key={t.id}
										onClick={() => handleTemplateChange(t.id)}
										className={cn(
											'flex-1 py-1.5 rounded-lg text-xs font-medium transition',
											liveTemplate === t.id
												? 'bg-indigo-600 text-white'
												: 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700',
										)}
									>
										{t.label}
									</button>
								))}
							</div>
						</div>

						{/* Current preview */}
						<div className='rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900'>
							<div className='flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700'>
								<div className='w-2 h-2 rounded-full bg-red-400' />
								<div className='w-2 h-2 rounded-full bg-yellow-400' />
								<div className='w-2 h-2 rounded-full bg-green-400' />
								<span className='ml-2 text-[10px] text-gray-400 truncate'>Live Preview</span>
							</div>
							<div style={{ height: '520px', overflow: 'hidden', position: 'relative' }}>
								<div
									className='origin-top-left pointer-events-none'
									style={{ transform: 'scale(0.52)', width: '192.3%' }}
								>
									<CVPreviewPanel data={cvData} template={liveTemplate} />
								</div>
							</div>
						</div>
					</div>
				</aside>
			)}
		</div>
	)
}
