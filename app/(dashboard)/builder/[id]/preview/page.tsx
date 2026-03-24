import { adminDB } from '@/lib/firebase/admin'
import { getServerUser } from '@/lib/firebase/session'
import type { CV, CVSection } from '@/types/cv.types'
import { notFound, redirect } from 'next/navigation'
import { PreviewClient } from './PreviewClient'

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
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

	const sectionsSnap = await adminDB()
		.collection('cv_sections')
		.where('cv_id', '==', id)
		.orderBy('order_index', 'asc')
		.get()

	const sections = sectionsSnap.docs.map(d => ({ ...(d.data() as CVSection), id: d.id }))

	return <PreviewClient cv={cv} sections={sections} />
}
