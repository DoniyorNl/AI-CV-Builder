'use client'

import { createClient } from '@/lib/supabase/client'
import type { CV, CVData, CVSection, SectionType } from '@/types/cv.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// ─── Fetch all CVs for the current user ─────────────────────
export function useCVList() {
	return useQuery({
		queryKey: ['cvs'],
		queryFn: async () => {
			const supabase = createClient()
			const { data, error } = await supabase
				.from('cvs')
				.select('*')
				.order('updated_at', { ascending: false })

			if (error) throw error
			return data as CV[]
		},
	})
}

// ─── Fetch a single CV with all its sections ─────────────────
export function useCV(cvId: string) {
	return useQuery({
		queryKey: ['cv', cvId],
		queryFn: async () => {
			const supabase = createClient()
			const { data: cv, error: cvError } = await supabase
				.from('cvs')
				.select('*')
				.eq('id', cvId)
				.single()

			if (cvError) throw cvError

			const { data: sections, error: sectionsError } = await supabase
				.from('cv_sections')
				.select('*')
				.eq('cv_id', cvId)
				.order('order_index', { ascending: true })

			if (sectionsError) throw sectionsError

			return { ...(cv as CV), sections: sections as CVSection[] }
		},
		enabled: !!cvId,
	})
}

// ─── Create a new CV ─────────────────────────────────────────
export function useCreateCV() {
	const queryClient = useQueryClient()
	const router = useRouter()

	return useMutation({
		mutationFn: async (title: string) => {
			const supabase = createClient()
			const {
				data: { user },
			} = await supabase.auth.getUser()
			if (!user) throw new Error('Not authenticated')

			const { data: cv, error: cvError } = await supabase
				.from('cvs')
				.insert({ user_id: user.id, title, template: 'modern', status: 'draft' })
				.select()
				.single()

			if (cvError) throw cvError

			// create default empty sections
			const defaultSections: Array<{
				cv_id: string
				type: SectionType
				content: object
				order_index: number
			}> = [
				{
					cv_id: cv.id,
					type: 'personal',
					content: { full_name: '', email: '', phone: '', city: '', linkedin: '' },
					order_index: 0,
				},
				{ cv_id: cv.id, type: 'summary', content: { text: '' }, order_index: 1 },
				{ cv_id: cv.id, type: 'experience', content: [], order_index: 2 },
				{ cv_id: cv.id, type: 'education', content: [], order_index: 3 },
				{ cv_id: cv.id, type: 'skills', content: { technical: [], soft: [] }, order_index: 4 },
				{ cv_id: cv.id, type: 'projects', content: [], order_index: 5 },
			]

			const { error: sectionsError } = await supabase.from('cv_sections').insert(defaultSections)

			if (sectionsError) throw sectionsError

			return cv as CV
		},
		onSuccess: cv => {
			queryClient.invalidateQueries({ queryKey: ['cvs'] })
			router.push(`/builder/${cv.id}/edit`)
		},
		onError: () => toast.error('Failed to create CV'),
	})
}

// ─── Update CV metadata (title, template, status) ────────────
export function useUpdateCV(cvId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (updates: Partial<Pick<CV, 'title' | 'template' | 'status'>>) => {
			const supabase = createClient()
			const { error } = await supabase.from('cvs').update(updates).eq('id', cvId)

			if (error) throw error
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['cv', cvId] })
			queryClient.invalidateQueries({ queryKey: ['cvs'] })
		},
	})
}

// ─── Update a single section ─────────────────────────────────
export function useUpdateSection(cvId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ sectionId, content }: { sectionId: string; content: object }) => {
			const supabase = createClient()
			const { error } = await supabase.from('cv_sections').update({ content }).eq('id', sectionId)

			if (error) throw error
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['cv', cvId] })
		},
	})
}

// ─── Delete a CV ─────────────────────────────────────────────
export function useDeleteCV() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (cvId: string) => {
			const supabase = createClient()
			const { error } = await supabase.from('cvs').delete().eq('id', cvId)

			if (error) throw error
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['cvs'] })
			toast.success('CV deleted')
		},
		onError: () => toast.error('Failed to delete CV'),
	})
}

// ─── Build CVData from sections array ────────────────────────
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
