import type { CVData, CVSection, SectionType } from '@/types/cv.types'

/**
 * Pure utility — no browser APIs, safe to use on both client and server.
 * Converts a flat sections array into a structured CVData object.
 */
export function sectionsToCVData(sections: CVSection[]): CVData {
	const get = <T>(type: SectionType, fallback: T): T => {
		const section = sections.find(s => s.type === type)
		return (section?.content as T) ?? fallback
	}

	return {
		personal: get('personal', { full_name: '', email: '', phone: '', city: '', linkedin: '' }),
		summary: get('summary', { text: '' }),
		experience: get('experience', []),
		education: get('education', []),
		skills: get('skills', { technical: [], soft: [] }),
		projects: get('projects', []),
	}
}
