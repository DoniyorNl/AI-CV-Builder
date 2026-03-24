import { adminDB } from '@/lib/firebase/admin'
import { getServerUser } from '@/lib/firebase/session'
import type { CV, CVSection } from '@/types/cv.types'
import { notFound, redirect } from 'next/navigation'
import { CVBuilderClient } from './CVBuilderClient'

export default async function EditCVPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	const user = await getServerUser()
	if (!user) redirect('/login')

	const cvSnap = await adminDB().collection('cvs').doc(id).get()
	const rawData = cvSnap.data()
	if (!cvSnap.exists || rawData?.user_id !== user.uid) notFound()

	const cvData = rawData!
	const cv: CV = {
		...(cvData as CV),
		id: cvSnap.id,
		created_at: cvData.created_at?.toDate().toISOString() ?? new Date().toISOString(),
		updated_at: cvData.updated_at?.toDate().toISOString() ?? new Date().toISOString(),
	}

	const sectionsSnap = await adminDB().collection('cv_sections').where('cv_id', '==', id).get()

	const sections = sectionsSnap.docs
		.map(d => {
			const data = d.data()
			return {
				...(data as CVSection),
				id: d.id,
				created_at: data.created_at?.toDate().toISOString() ?? new Date().toISOString(),
				updated_at: data.updated_at?.toDate().toISOString() ?? new Date().toISOString(),
			}
		})
		.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))

	return <CVBuilderClient cv={cv} sections={sections} />
}
