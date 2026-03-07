import { generateSection } from '@/lib/openai'
import { createClient } from '@/lib/supabase/server'
import type { AIGenerateRequest } from '@/types/cv.types'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
	// ── Auth ────────────────────────────────────────────────────
	const supabase = await createClient()
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser()

	if (authError || !user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	// ── Parse body ──────────────────────────────────────────────
	let body: AIGenerateRequest
	try {
		body = (await req.json()) as AIGenerateRequest
	} catch {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
	}

	const { section, content, context } = body

	if (!section || !content) {
		return NextResponse.json({ error: 'Missing section or content' }, { status: 400 })
	}

	// ── Validate section ────────────────────────────────────────
	const allowedSections = ['summary', 'experience', 'education', 'skills', 'projects', 'personal']
	if (!allowedSections.includes(section)) {
		return NextResponse.json({ error: 'Invalid section type' }, { status: 400 })
	}

	// ── Generate ────────────────────────────────────────────────
	try {
		const result = await generateSection(section, content, context)
		return NextResponse.json(result)
	} catch (err) {
		console.error('[cv/generate] OpenAI error:', err)
		return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
	}
}
