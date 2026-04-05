'use client'

import { useAuthUser } from '@/lib/firebase/auth-provider'
import { db } from '@/lib/firebase/client'
import type { CV, CVSection, SectionType } from '@/types/cv.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export { sectionsToCVData } from '@/lib/cv-utils'
import {
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
	Timestamp,
	updateDoc,
	where,
	writeBatch,
} from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Convert Firestore Timestamp → ISO string for our CV types
function toISO(ts: Timestamp | string | null | undefined): string {
	if (!ts) return new Date().toISOString()
	if (typeof ts === 'string') return ts
	return ts.toDate().toISOString()
}

// ─── Fetch all CVs for the current user ─────────────────────
export function useCVList() {
	const { user } = useAuthUser()

	return useQuery({
		queryKey: ['cvs'],
		enabled: !!user,
		queryFn: async () => {
			const q = query(
				collection(db, 'cvs'),
				where('user_id', '==', user!.uid),
				orderBy('updated_at', 'desc'),
			)
			const snap = await getDocs(q)
			return snap.docs.map(
				d =>
					({
						...d.data(),
						id: d.id,
						created_at: toISO((d.data() as { created_at?: Timestamp }).created_at),
						updated_at: toISO((d.data() as { updated_at?: Timestamp }).updated_at),
					}) as CV,
			)
		},
	})
}

// ─── Fetch a single CV with all its sections ─────────────────
export function useCV(cvId: string) {
	return useQuery({
		queryKey: ['cv', cvId],
		enabled: !!cvId,
		queryFn: async () => {
			const cvSnap = await getDoc(doc(db, 'cvs', cvId))
			if (!cvSnap.exists()) throw new Error('CV not found')

			const cvData = cvSnap.data()
			const cv: CV = {
				...(cvData as CV),
				id: cvSnap.id,
				created_at: toISO((cvData as { created_at?: Timestamp }).created_at),
				updated_at: toISO((cvData as { updated_at?: Timestamp }).updated_at),
			}

			const sectionsSnap = await getDocs(
				query(
					collection(db, 'cv_sections'),
					where('cv_id', '==', cvId),
					orderBy('order_index', 'asc'),
				),
			)
			const sections = sectionsSnap.docs.map(
				d => ({ ...(d.data() as CVSection), id: d.id }) as CVSection,
			)

			return { ...cv, sections }
		},
	})
}

// ─── Create a new CV ─────────────────────────────────────────
export function useCreateCV() {
	const queryClient = useQueryClient()
	const router = useRouter()

	return useMutation({
		mutationFn: async (title: string) => {
			const { auth } = await import('@/lib/firebase/client')
			const user = auth.currentUser
			if (!user) throw new Error('Not authenticated')

			const now = serverTimestamp()

			const cvRef = await addDoc(collection(db, 'cvs'), {
				user_id: user.uid,
				title,
				template: 'modern',
				status: 'draft',
				created_at: now,
				updated_at: now,
			})

			const defaultSections: Array<{
				cv_id: string
				user_id: string
				type: SectionType
				content: object
				order_index: number
			}> = [
				{
					cv_id: cvRef.id,
					user_id: user.uid,
					type: 'personal',
					content: { full_name: '', email: '', phone: '', city: '', linkedin: '' },
					order_index: 0,
				},
				{
					cv_id: cvRef.id,
					user_id: user.uid,
					type: 'summary',
					content: { text: '' },
					order_index: 1,
				},
				{ cv_id: cvRef.id, user_id: user.uid, type: 'experience', content: [], order_index: 2 },
				{ cv_id: cvRef.id, user_id: user.uid, type: 'education', content: [], order_index: 3 },
				{
					cv_id: cvRef.id,
					user_id: user.uid,
					type: 'skills',
					content: { technical: [], soft: [] },
					order_index: 4,
				},
				{ cv_id: cvRef.id, user_id: user.uid, type: 'projects', content: [], order_index: 5 },
			]

			const batch = writeBatch(db)
			for (const section of defaultSections) {
				batch.set(doc(collection(db, 'cv_sections')), {
					...section,
					created_at: now,
					updated_at: now,
				})
			}
			await batch.commit()

			return { id: cvRef.id, title, template: 'modern', status: 'draft' } as CV
		},
		onSuccess: cv => {
			queryClient.invalidateQueries({ queryKey: ['cvs'] })
			router.push(`/builder/${cv.id}/edit`)
		},
		onError: (err: unknown) => {
			console.error('Create CV error:', err)
			const msg = err instanceof Error ? err.message : 'Unknown error'
			toast.error(`Failed to create CV: ${msg}`)
		},
	})
}

// ─── Update CV metadata (title, template, status) ────────────
export function useUpdateCV(cvId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (updates: Partial<Pick<CV, 'title' | 'template' | 'status'>>) => {
			await updateDoc(doc(db, 'cvs', cvId), { ...updates, updated_at: serverTimestamp() })
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
			await updateDoc(doc(db, 'cv_sections', sectionId), {
				content,
				updated_at: serverTimestamp(),
			})
			// Bump the parent CV's updated_at so lists stay sorted correctly
			await updateDoc(doc(db, 'cvs', cvId), { updated_at: serverTimestamp() })
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['cv', cvId] })
		},
	})
}

// ─── Delete a CV (and all its sections) ──────────────────────
export function useDeleteCV() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (cvId: string) => {
			const sectionsSnap = await getDocs(
				query(collection(db, 'cv_sections'), where('cv_id', '==', cvId)),
			)
			const batch = writeBatch(db)
			sectionsSnap.docs.forEach(d => batch.delete(d.ref))
			batch.delete(doc(db, 'cvs', cvId))
			await batch.commit()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['cvs'] })
			toast.success('CV deleted')
		},
		onError: () => toast.error('Failed to delete CV'),
	})
}

