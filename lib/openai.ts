import type { CVData, ExperienceItem, SectionContent, SectionType } from '@/types/cv.types'

// ─── AI Provider selector ────────────────────────────────────
// If OPENAI_API_KEY is set and valid → use OpenAI
// Otherwise → use free mock responses (great for portfolio demos)

async function tryOpenAI(prompt: string, json = false): Promise<string | null> {
	const key = process.env.OPENAI_API_KEY
	if (!key || key.startsWith('sk-YOUR') || key === '') return null

	try {
		const OpenAI = (await import('openai')).default
		const client = new OpenAI({ apiKey: key })
		const response = await client.chat.completions.create({
			model: 'gpt-4o-mini',
			...(json ? { response_format: { type: 'json_object' as const } } : {}),
			messages: [{ role: 'user', content: prompt }],
			temperature: 0.7,
			max_tokens: json ? 400 : 300,
		})
		return response.choices[0].message.content?.trim() ?? null
	} catch {
		return null
	}
}

// ─── Mock responses (portfolio demo mode) ───────────────────

function mockSummary(rawText: string, context?: Partial<CVData>): string {
	const position = context?.experience?.[0]?.position ?? 'Software Engineer'
	const name = context?.personal?.full_name?.split(' ')[0] ?? 'The candidate'
	const skills = context?.skills?.technical?.slice(0, 3).join(', ') ?? 'modern technologies'

	const templates = [
		`Results-driven ${position} with a proven track record of delivering high-quality software solutions. Skilled in ${skills}, with a passion for building scalable and maintainable systems. ${name} brings strong problem-solving abilities and a collaborative mindset to every project. Committed to continuous learning and staying current with industry best practices.`,
		`Dynamic ${position} combining technical expertise with strong communication skills. Proficient in ${skills} and experienced in leading cross-functional teams to deliver impactful products on time. Known for writing clean, efficient code and mentoring junior developers. Eager to contribute to innovative projects that make a real difference.`,
		`Versatile ${position} with hands-on experience building end-to-end applications using ${skills}. Passionate about clean architecture, performance optimization, and user-centric design. ${name} has consistently delivered measurable improvements in system reliability and team productivity. Thrives in fast-paced environments and embraces new challenges.`,
	]

	const pick = Math.abs(rawText.length % templates.length)
	return templates[pick]
}

function mockBullets(item: ExperienceItem): string[] {
	const position = item.position ?? 'Developer'
	const company = item.company ?? 'the company'

	return [
		`Led development of key features at ${company}, improving system performance by 40%`,
		`Collaborated with cross-functional teams to deliver ${position} projects 20% ahead of schedule`,
		`Implemented automated testing pipelines, reducing production bugs by 35%`,
		`Mentored 3 junior developers and conducted weekly code reviews to maintain code quality`,
		`Optimized database queries and API endpoints, cutting average response time from 800ms to 120ms`,
	].slice(0, 4)
}

// ─── Generation functions ────────────────────────────────────

export async function generateSummary(rawText: string, context?: Partial<CVData>): Promise<string> {
	const position = context?.experience?.[0]?.position ?? 'professional'
	const prompt = `You are an expert CV writer. Write a compelling professional summary (3-4 sentences) for a ${position}.

Raw input from the candidate:
"${rawText}"

Requirements:
- Start with a strong opening statement
- Highlight key skills and experience level
- Use active voice
- Do NOT use first-person pronouns (no "I", "my", "me")
- Return ONLY the summary text, no extra commentary`

	const result = await tryOpenAI(prompt)
	return result ?? mockSummary(rawText, context)
}

export async function generateExperienceBullets(item: ExperienceItem): Promise<string[]> {
	const prompt = `You are an expert CV writer. Convert this job description into 3-5 impactful bullet points.

Company: ${item.company}
Position: ${item.position}
Raw description: "${item.raw_description ?? item.bullets.join(', ')}"

Requirements:
- Start each bullet with a strong action verb (Led, Built, Improved, Designed, etc.)
- Include quantifiable results where possible (%, $, time saved)
- Each bullet max 15 words
- Respond as JSON: {"bullets": ["...", "..."]}`

	const result = await tryOpenAI(prompt, true)
	if (result) {
		try {
			const parsed = JSON.parse(result) as { bullets?: string[] }
			if (parsed.bullets?.length) return parsed.bullets
		} catch {}
	}
	return mockBullets(item)
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
		const results = await Promise.all(items.map(item => generateExperienceBullets(item)))
		return { bullets: results[0] ?? [] }
	}

	return {}
}
