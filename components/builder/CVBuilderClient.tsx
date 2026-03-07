'use client'

import { useAutoSave } from '@/hooks/useAutoSave'
import { sectionsToCVData, useUpdateSection } from '@/hooks/useCV'
import { cn } from '@/lib/utils'
import type { CV, CVData, CVSection, SectionType } from '@/types/cv.types'
import {
	AlignLeft,
	Briefcase,
	CheckCircle2,
	Eye,
	FolderGit2,
	GraduationCap,
	Loader2,
	User,
	Wrench,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useState } from 'react'
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

interface Props {
	cv: CV
	sections: CVSection[]
}

type SaveStatus = 'idle' | 'saving' | 'saved'

export function CVBuilderClient({ cv, sections }: Props) {
	const [activeSection, setActiveSection] = useState<SectionType>('personal')
	const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
	const [cvData, setCvData] = useState<CVData>(() => sectionsToCVData(sections))

	const { mutateAsync: updateSection } = useUpdateSection(cv.id)

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
		},
	)

	const updateData = <K extends keyof CVData>(key: K, value: CVData[K]) => {
		setCvData(prev => ({ ...prev, [key]: value }))
	}

	return (
		<div className='flex gap-6 min-h-[calc(100vh-8rem)]'>
			{/* Sidebar nav */}
			<aside className='w-56 shrink-0'>
				<div className='bg-white rounded-2xl border border-gray-200 p-3 sticky top-24'>
					<nav className='space-y-1'>
						{SECTIONS.map(({ type, label, icon: Icon }) => (
							<button
								key={type}
								onClick={() => setActiveSection(type)}
								className={cn(
									'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition',
									activeSection === type
										? 'bg-indigo-50 text-indigo-700'
										: 'text-gray-600 hover:bg-gray-50',
								)}
							>
								<Icon className='w-4 h-4 shrink-0' />
								{label}
							</button>
						))}
					</nav>

					<div className='mt-4 pt-4 border-t border-gray-100 space-y-2'>
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

						<Link
							href={`/builder/${cv.id}/preview`}
							onClick={() => flush()}
							className='w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-sm font-medium transition'
						>
							<Eye className='w-4 h-4' />
							Preview CV
						</Link>
					</div>
				</div>
			</aside>

			{/* Active section form */}
			<div className='flex-1 bg-white rounded-2xl border border-gray-200 p-8 min-w-0'>
				<h2 className='text-lg font-semibold text-gray-900 mb-6'>
					{SECTIONS.find(s => s.type === activeSection)?.label}
				</h2>

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
					<ExperienceSection data={cvData.experience} onChange={v => updateData('experience', v)} />
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
		</div>
	)
}
