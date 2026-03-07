import type { CVData, ExperienceItem, SectionContent, SectionType } from '@/types/cv.types'
import OpenAI from 'openai'

export const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

// ─── Prompt builders ────────────────────────────────────────

function buildSummaryPrompt(rawText: string, context?: Partial<CVData>): string {
	const positionHint = context?.experience?.[0]?.position ?? 'professional'
	return `You are an expert CV writer. Write a compelling professional summary (3-4 sentences) for a ${positionHint}.

Raw input from the candidate:
"${rawText}"

Requirements:
- Start with a strong opening statement
- Highlight key skills and experience level
- Use active voice
- Do NOT use first-person pronouns (no "I", "my", "me")
- Return ONLY the summary text, no extra commentary`
}

function buildExperienceBulletsPrompt(item: ExperienceItem): string {
	return `You are an expert CV writer. Convert this job description into 3-5 impactful bullet points.

Company: ${item.company}
Position: ${item.position}
Raw description: "${item.raw_description ?? item.bullets.join(', ')}"

Requirements:
- Start each bullet with a strong action verb (Led, Built, Improved, Designed, etc.)
- Include quantifiable results where possible (%, $, time saved)
- Each bullet max 15 words
- Return a JSON array of strings ONLY, e.g.: ["Led...", "Built..."]`
}

// ─── Generation functions ────────────────────────────────────

export async function generateSummary(rawText: string, context?: Partial<CVData>): Promise<string> {
	const response = await openai.chat.completions.create({
		model: 'gpt-4o',
		messages: [{ role: 'user', content: buildSummaryPrompt(rawText, context) }],
		temperature: 0.7,
		max_tokens: 300,
	})

	return response.choices[0].message.content?.trim() ?? ''
}

export async function generateExperienceBullets(item: ExperienceItem): Promise<string[]> {
	const response = await openai.chat.completions.create({
		model: 'gpt-4o',
		response_format: { type: 'json_object' },
		messages: [
			{
				role: 'system',
				content: 'You are a CV writing assistant. Always respond with valid JSON.',
			},
			{
				role: 'user',
				content: `${buildExperienceBulletsPrompt(item)}\n\nRespond as: {"bullets": [...]}`,
			},
		],
		temperature: 0.7,
		max_tokens: 400,
	})

	const raw = response.choices[0].message.content ?? '{}'
	const parsed = JSON.parse(raw) as { bullets?: string[] }
	return parsed.bullets ?? []
}

export async function generateSection(
	section: SectionType,
	content: SectionContent,
	context?: Partial<CVData>,
): Promise<{ summary?: string; bullets?: string[] }> {
	if (section === 'summary') {
		const text = (content as { text: string }).text
		const summary = await generateSummary(text, context)
		return { summary }
	}

	if (section === 'experience') {
		const items = content as ExperienceItem[]
		// Generate bullets for each experience item
		const results = await Promise.all(items.map(item => generateExperienceBullets(item)))
		// Return bullets for first item (UI calls per-item)
		return { bullets: results[0] ?? [] }
	}

	return {}
}
