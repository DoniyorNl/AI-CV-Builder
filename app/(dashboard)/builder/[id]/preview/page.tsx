import { createClient } from '@/lib/supabase/server'
import type { CV, CVSection } from '@/types/cv.types'
import { notFound } from 'next/navigation'
import { PreviewClient } from './PreviewClient'

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const supabase = await createClient()

	const { data: cv, error } = await supabase.from('cvs').select('*').eq('id', id).single()

	if (error || !cv) notFound()

	const { data: sections } = await supabase
		.from('cv_sections')
		.select('*')
		.eq('cv_id', id)
		.order('order_index', { ascending: true })

	return <PreviewClient cv={cv as CV} sections={(sections ?? []) as CVSection[]} />
}
