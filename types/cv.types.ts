export type Template = 'modern' | 'minimal' | 'classic'
export type CVStatus = 'draft' | 'published'
export type SectionType =
	| 'personal'
	| 'summary'
	| 'experience'
	| 'education'
	| 'skills'
	| 'projects'

export interface PersonalInfo {
	full_name: string
	email: string
	phone: string
	city: string
	linkedin?: string
	website?: string
}

export interface SummaryContent {
	text: string
}

export interface ExperienceItem {
	id: string
	company: string
	position: string
	start_date: string
	end_date: string
	current: boolean
	bullets: string[]
	raw_description?: string
}

export interface EducationItem {
	id: string
	institution: string
	degree: string
	field: string
	start_year: string
	end_year: string
}

export interface SkillsContent {
	technical: string[]
	soft: string[]
}

export interface ProjectItem {
	id: string
	name: string
	link?: string
	description: string
	technologies: string[]
}

export type SectionContent =
	| PersonalInfo
	| SummaryContent
	| ExperienceItem[]
	| EducationItem[]
	| SkillsContent
	| ProjectItem[]

export interface CVSection {
	id: string
	cv_id: string
	type: SectionType
	content: SectionContent
	order_index: number
}

export interface CV {
	id: string
	user_id: string
	title: string
	template: Template
	status: CVStatus
	created_at: string
	updated_at: string
	sections?: CVSection[]
}

export interface CVData {
	personal: PersonalInfo
	summary: SummaryContent
	experience: ExperienceItem[]
	education: EducationItem[]
	skills: SkillsContent
	projects: ProjectItem[]
}

export interface AIGenerateRequest {
	section: SectionType
	content: SectionContent
	context?: Partial<CVData>
}

export interface AIGenerateResponse {
	summary?: string
	bullets?: string[]
	error?: string
}
