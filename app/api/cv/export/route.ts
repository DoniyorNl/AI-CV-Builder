import { sectionsToCVData } from '@/hooks/useCV'
import { generatePDFBuffer } from '@/lib/pdf'
import { createClient } from '@/lib/supabase/server'
import type { CVData, CVSection, Template } from '@/types/cv.types'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
	// ── Auth ─────────────────────────────────────────────────────
	const supabase = await createClient()
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser()

	if (authError || !user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	// ── Check Pro subscription ─────────────────────────────────
	const { data: profile } = await supabase
		.from('profiles')
		.select('is_pro')
		.eq('id', user.id)
		.single()

	const isPro = (profile as { is_pro?: boolean } | null)?.is_pro ?? false

	if (!isPro) {
		return NextResponse.json(
			{ error: 'PDF download requires Pro plan', upgrade: '/billing' },
			{ status: 402 },
		)
	}

	// ── Validate query params ─────────────────────────────────
	const { searchParams } = new URL(req.url)
	const cvId = searchParams.get('id')
	const template = (searchParams.get('template') ?? 'modern') as Template

	if (!cvId) {
		return NextResponse.json({ error: 'CV id is required' }, { status: 400 })
	}

	const allowedTemplates: Template[] = ['modern', 'minimal', 'classic']
	if (!allowedTemplates.includes(template)) {
		return NextResponse.json({ error: 'Invalid template' }, { status: 400 })
	}

	// ── Fetch CV and verify ownership ─────────────────────────
	const { data: cv, error: cvError } = await supabase
		.from('cvs')
		.select('*')
		.eq('id', cvId)
		.eq('user_id', user.id)
		.single()

	if (cvError || !cv) {
		return NextResponse.json({ error: 'CV not found' }, { status: 404 })
	}

	// ── Fetch sections ────────────────────────────────────────
	const { data: sections } = await supabase
		.from('cv_sections')
		.select('*')
		.eq('cv_id', cvId)
		.order('order_index', { ascending: true })

	const cvData: CVData = sectionsToCVData((sections ?? []) as CVSection[])

	// ── Generate PDF ──────────────────────────────────────────
	try {
		const buffer = await generatePDFBuffer(cvData, template)

		const safeTitle = (cv as { title?: string }).title?.replace(/[^a-z0-9-_ ]/gi, '') ?? 'cv'

		return new NextResponse(buffer as unknown as BodyInit, {
			status: 200,
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="${safeTitle}.pdf"`,
				'Content-Length': String(buffer.length),
				// Prevent caching of sensitive PDF content
				'Cache-Control': 'no-store, no-cache, must-revalidate',
			},
		})
	} catch (err) {
		console.error('[cv/export] PDF generation error:', err)
		return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
	}
}
