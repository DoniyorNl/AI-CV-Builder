import { adminDB } from '@/lib/firebase/admin'
import type { CV, CVSection } from '@/types/cv.types'
import { notFound } from 'next/navigation'
import { CVBuilderClient } from './CVBuilderClient'

export default async function EditCVPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	const cvSnap = await adminDB().collection('cvs').doc(id).get()
	if (!cvSnap.exists) notFound()

	const cvData = cvSnap.data()!
	const cv: CV = {
		...(cvData as CV),
		id: cvSnap.id,
		created_at: cvData.created_at?.toDate().toISOString() ?? new Date().toISOString(),
		updated_at: cvData.updated_at?.toDate().toISOString() ?? new Date().toISOString(),
	}

	const sectionsSnap = await adminDB()
		.collection('cv_sections')
		.where('cv_id', '==', id)
		.orderBy('order_index', 'asc')
		.get()

	const sections = sectionsSnap.docs.map(d => ({ ...(d.data() as CVSection), id: d.id }))

	return <CVBuilderClient cv={cv} sections={sections} />
}
