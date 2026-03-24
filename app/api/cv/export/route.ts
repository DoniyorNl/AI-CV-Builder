import { sectionsToCVData } from '@/hooks/useCV'
import { adminDB } from '@/lib/firebase/admin'
import { getServerUser } from '@/lib/firebase/session'
import { generatePDFBuffer } from '@/lib/pdf'
import type { CVData, CVSection, Template } from '@/types/cv.types'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
	// ── Auth ─────────────────────────────────────────────────────
	const user = await getServerUser()
	if (!user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	// ── Check Pro subscription ─────────────────────────────────
	const profileSnap = await adminDB().collection('users').doc(user.uid).get()
	const isPro = (profileSnap.data()?.is_pro as boolean | undefined) ?? false

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
	const cvSnap = await adminDB().collection('cvs').doc(cvId).get()
	if (!cvSnap.exists || cvSnap.data()?.user_id !== user.uid) {
		return NextResponse.json({ error: 'CV not found' }, { status: 404 })
	}

	// ── Fetch sections ────────────────────────────────────────
	const sectionsSnap = await adminDB().collection('cv_sections').where('cv_id', '==', cvId).get()

	const sections = sectionsSnap.docs
		.map(d => d.data() as CVSection)
		.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
	const cvData: CVData = sectionsToCVData(sections)

	// ── Generate PDF ──────────────────────────────────────────
	try {
		const buffer = await generatePDFBuffer(cvData, template, !isPro)
		const safeTitle =
			(cvSnap.data()?.title as string | undefined)?.replace(/[^a-z0-9-_ ]/gi, '') ?? 'cv'

		return new NextResponse(buffer as unknown as BodyInit, {
			status: 200,
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="${safeTitle}.pdf"`,
				'Content-Length': String(buffer.length),
				'Cache-Control': 'no-store, no-cache, must-revalidate',
			},
		})
	} catch (err) {
		console.error('[cv/export] PDF generation error:', err)
		return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
	}
}
