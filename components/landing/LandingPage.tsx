'use client'

import { ClassicPreview } from '@/components/templates/previews/ClassicPreview'
import { MinimalPreview } from '@/components/templates/previews/MinimalPreview'
import { ModernPreview } from '@/components/templates/previews/ModernPreview'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuthUser } from '@/lib/firebase/auth-provider'
import type { CVData, Template } from '@/types/cv.types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// ─── Demo CV data for template previews ──────────────────────────────────────
const DEMO_CV: CVData = {
	personal: {
		full_name: 'Alex Johnson',
		email: 'alex@example.com',
		phone: '+1 555 123 4567',
		city: 'San Francisco, CA',
		linkedin: 'linkedin.com/in/alexj',
		website: '',
	},
	summary: {
		text: 'Senior Full-Stack Engineer with 7+ years building scalable web applications. Passionate about clean code, AI-driven tools, and exceptional user experiences that delight millions of users.',
	},
	experience: [
		{
			id: '1',
			company: 'Stripe',
			position: 'Senior Software Engineer',
			start_date: 'Jan 2022',
			end_date: '',
			current: true,
			bullets: [
				'Led migration of payment infrastructure handling 10M+ transactions daily',
				'Reduced API latency by 40% through intelligent caching strategies',
				'Mentored 6 engineers across 3 time zones',
			],
			raw_description: '',
		},
		{
			id: '2',
			company: 'Vercel',
			position: 'Software Engineer',
			start_date: 'Mar 2019',
			end_date: 'Dec 2021',
			current: false,
			bullets: [
				'Built core deployment pipeline features for the Next.js edge network',
				'Improved cold-start performance by 60% through runtime optimization',
			],
			raw_description: '',
		},
	],
	education: [
		{
			id: '1',
			institution: 'Stanford University',
			degree: 'B.S.',
			field: 'Computer Science',
			start_year: '2014',
			end_year: '2018',
		},
	],
	skills: {
		technical: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
		soft: ['Leadership', 'System Design', 'Code Review'],
	},
	projects: [
		{
			id: '1',
			name: 'OpenMetrics',
			link: 'github.com/alexj/openmetrics',
			description: 'Open-source real-time analytics dashboard used by 5,000+ developers worldwide',
			technologies: ['React', 'ClickHouse', 'WebSockets'],
		},
	],
}

const TEMPLATES: { id: Template; label: string }[] = [
	{ id: 'modern', label: 'Modern' },
	{ id: 'classic', label: 'Classic' },
	{ id: 'minimal', label: 'Minimal' },
]

const FEATURES = [
	{
		icon: (
			<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					strokeWidth={1.8}
					d='M13 10V3L4 14h7v7l9-11h-7z'
				/>
			</svg>
		),
		title: 'AI-Powered Writing',
		desc: 'GPT-4 rewrites your summary and experience bullets to be more compelling and ATS-friendly — in one click.',
	},
	{
		icon: (
			<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					strokeWidth={1.8}
					d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
				/>
			</svg>
		),
		title: 'Pixel-Perfect PDF',
		desc: 'Download professionally formatted PDFs that pass ATS scanners and look stunning in any inbox.',
	},
	{
		icon: (
			<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					strokeWidth={1.8}
					d='M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z'
				/>
			</svg>
		),
		title: '3 Pro Templates',
		desc: 'Modern, Classic, and Minimal designs built for different industries. Switch templates with one click.',
	},
	{
		icon: (
			<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					strokeWidth={1.8}
					d='M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4'
				/>
			</svg>
		),
		title: 'Auto-Save',
		desc: 'Every keystroke is saved automatically. Your work is always safe, whether you close the tab or not.',
	},
	{
		icon: (
			<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					strokeWidth={1.8}
					d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
				/>
			</svg>
		),
		title: 'Version History',
		desc: 'Keep multiple CV versions for different roles. Pin your best version and restore any snapshot.',
	},
	{
		icon: (
			<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					strokeWidth={1.8}
					d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
				/>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					strokeWidth={1.8}
					d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
				/>
			</svg>
		),
		title: 'Live Preview',
		desc: 'See your CV update in real-time as you type. No reloading, no switching pages.',
	},
]

const TESTIMONIALS = [
	{
		name: 'Sarah Chen',
		role: 'Product Manager at Google',
		avatar: 'SC',
		text: 'I rewrote my CV in 15 minutes and landed 3 interviews the same week. The AI suggestions are genuinely impressive — it sounds like me but way better.',
		rating: 5,
	},
	{
		name: 'Marcus Webb',
		role: 'Software Engineer at Meta',
		avatar: 'MW',
		text: "The live preview and template switching saved me hours. I've tried 6 CV builders — this one actually produces beautiful PDFs that don't look like they're from 2010.",
		rating: 5,
	},
	{
		name: 'Priya Sharma',
		role: 'Data Scientist at Airbnb',
		avatar: 'PS',
		text: 'Clean, fast, and the PDFs look incredibly professional. The AI rewrote my summary in a way I would never have thought of. Worth every penny of the Pro plan.',
		rating: 5,
	},
]

const FAQS = [
	{
		q: 'Is the free plan really free?',
		a: 'Yes. You can create, edit, and preview unlimited CVs on the free plan. PDF export with watermark is included. Upgrade to Pro to remove the watermark and unlock unlimited AI improvements.',
	},
	{
		q: 'How does the AI improve my CV?',
		a: 'Our AI (powered by GPT-4o) rewrites your summary and experience bullets to be more impactful, action-oriented, and tailored for modern ATS systems — all in one click per section.',
	},
	{
		q: 'Can I create multiple CVs?',
		a: 'Yes. Unlimited CVs on any plan. Each CV can have its own template, content, and version history — perfect for tailoring applications to different roles.',
	},
	{
		q: 'What export formats are supported?',
		a: 'PDF export is available on all plans (watermarked on Free, clean on Pro). We use react-pdf to generate pixel-perfect, ATS-friendly files.',
	},
	{
		q: 'Can I cancel my Pro subscription?',
		a: 'Yes, anytime. No questions asked. Your CVs remain fully accessible on the free plan after cancellation.',
	},
]

// ─── AI Demo data ─────────────────────────────────────────────────────────────
const AI_DEMO_ITEMS = [
	{
		label: 'Career Summary',
		before:
			'I am a software developer with experience in coding. I have worked at some companies and built applications that people use.',
		after:
			'Full-Stack Engineer with 6+ years shipping production software at scale. Drove a 45% reduction in API response times, led cross-functional teams of 8 engineers, and delivered 12 product features that grew MAU by 28% — consistently ahead of schedule.',
	},
	{
		label: 'Experience Bullet',
		before:
			'Helped build the website and fixed various bugs and issues that came up during the project.',
		after:
			'Architected a zero-downtime migration of 2.3M user records, eliminating 6 hours of weekly maintenance while improving query performance by 70% through strategic database indexing and connection pooling.',
	},
	{
		label: 'Project Description',
		before:
			'Built an app that helps users manage their tasks and be more productive during the day.',
		after:
			'Engineered a real-time task platform with AI-powered prioritization — ranked Top 5 Product of the Week on Product Hunt, 3,200+ active users, 4.9★ rating, and 91% Day-7 retention via WebSocket architecture and Redis caching.',
	},
]

// ─── FAQ accordion item ───────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
	const [open, setOpen] = useState(false)
	return (
		<div className='border-b border-gray-100 dark:border-slate-700 last:border-0'>
			<button
				onClick={() => setOpen(v => !v)}
				className='w-full flex justify-between items-center py-4 text-left gap-4 cursor-pointer'
			>
				<span className='font-medium text-gray-900 dark:text-white text-sm'>{q}</span>
				<span
					className={`text-indigo-500 dark:text-indigo-400 text-xl font-light shrink-0 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
				>
					+
				</span>
			</button>
			{open && (
				<p className='pb-4 text-gray-600 dark:text-slate-400 text-sm leading-relaxed'>{a}</p>
			)}
		</div>
	)
}

// ─── AI Live Demo widget ──────────────────────────────────────────────────────
function AIDemoWidget() {
	const [demoIndex, setDemoIndex] = useState(0)
	const [state, setState] = useState<'idle' | 'improving' | 'done'>('idle')
	const [displayed, setDisplayed] = useState('')
	const current = AI_DEMO_ITEMS[demoIndex]

	const handleImprove = () => {
		if (state === 'improving') return
		setState('improving')
		setDisplayed('')
		let i = 0
		const target = current.after
		const step = () => {
			if (i < target.length) {
				i += Math.floor(Math.random() * 3) + 1
				setDisplayed(target.slice(0, Math.min(i, target.length)))
				setTimeout(step, 14 + Math.random() * 18)
			} else {
				setDisplayed(target)
				setState('done')
			}
		}
		setTimeout(step, 250)
	}

	const handleNext = () => {
		setDemoIndex(prev => (prev + 1) % AI_DEMO_ITEMS.length)
		setState('idle')
		setDisplayed('')
	}

	return (
		<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-xl shadow-indigo-100/40 dark:shadow-indigo-950/40'>
			{/* Header bar */}
			<div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/60'>
				<div className='flex items-center gap-2'>
					<div className='w-2 h-2 rounded-full bg-indigo-500 animate-pulse' />
					<span className='text-sm font-semibold text-gray-700 dark:text-slate-300'>
						{current.label}
					</span>
				</div>
				<div className='flex items-center gap-1.5'>
					{AI_DEMO_ITEMS.map((_, i) => (
						<div
							key={i}
							className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
								i === demoIndex ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-600'
							}`}
						/>
					))}
				</div>
			</div>

			{/* Before / After columns */}
			<div className='grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-slate-700'>
				{/* Before */}
				<div className='p-6'>
					<p className='text-xs font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-1.5'>
						<svg className='w-3 h-3' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2.5}
								d='M6 18L18 6M6 6l12 12'
							/>
						</svg>
						Before
					</p>
					<p className='text-sm text-gray-400 dark:text-slate-500 leading-relaxed min-h-20 line-through decoration-red-300 dark:decoration-red-700'>
						{current.before}
					</p>
				</div>

				{/* After */}
				<div className='p-6 bg-indigo-50/30 dark:bg-indigo-950/20'>
					<p className='text-xs font-bold text-green-600 dark:text-green-500 uppercase tracking-wider mb-3 flex items-center gap-1.5'>
						<svg className='w-3 h-3' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2.5}
								d='M5 13l4 4L19 7'
							/>
						</svg>
						After AI
						{state === 'improving' && (
							<span className='ml-1 text-[10px] font-normal text-indigo-500 normal-case tracking-normal'>
								writing…
							</span>
						)}
					</p>
					<p className='text-sm leading-relaxed min-h-20'>
						{state === 'idle' ? (
							<span className='text-gray-300 dark:text-slate-600 italic'>
								Click ✨ Improve to see the magic…
							</span>
						) : (
							<span className='text-gray-800 dark:text-slate-200'>
								{displayed}
								{state === 'improving' && (
									<span className='inline-block w-0.5 h-3.5 bg-indigo-600 dark:bg-indigo-400 ml-0.5 animate-pulse align-middle' />
								)}
							</span>
						)}
					</p>
				</div>
			</div>

			{/* Actions footer */}
			<div className='flex items-center gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/60'>
				<button
					onClick={state === 'done' ? handleImprove : handleImprove}
					disabled={state === 'improving'}
					className='flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed'
				>
					{state === 'improving' ? (
						<>
							<div className='w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin' />
							Improving…
						</>
					) : (
						<>
							<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M13 10V3L4 14h7v7l9-11h-7z'
								/>
							</svg>
							{state === 'done' ? 'Replay' : '✨ Improve with AI'}
						</>
					)}
				</button>
				{state === 'done' && (
					<button
						onClick={handleNext}
						className='text-sm text-gray-500 dark:text-slate-400 hover:text-indigo-600 font-medium transition-colors cursor-pointer'
					>
						Next example →
					</button>
				)}
				<span className='ml-auto text-xs text-gray-400 dark:text-slate-500'>
					{demoIndex + 1} / {AI_DEMO_ITEMS.length}
				</span>
			</div>
		</div>
	)
}

// ─── Scaled template preview inside browser chrome ───────────────────────────
function BrowserMockup({
	children,
	url,
	height,
	scale,
}: {
	children: React.ReactNode
	url: string
	height: number
	scale: number
}) {
	const innerWidth = `${(100 / scale).toFixed(2)}%`
	return (
		<div className='bg-white dark:bg-slate-900/90 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-700'>
			{/* Browser bar */}
			<div className='bg-gray-100 dark:bg-slate-800 px-4 py-2.5 flex items-center gap-1.5 border-b border-gray-200 dark:border-slate-700 shrink-0'>
				<div className='w-2.5 h-2.5 rounded-full bg-red-400' />
				<div className='w-2.5 h-2.5 rounded-full bg-yellow-400' />
				<div className='w-2.5 h-2.5 rounded-full bg-green-400' />
				<div className='ml-2 flex-1 bg-white dark:bg-slate-700 rounded text-xs text-gray-400 dark:text-slate-400 px-2 py-0.5 text-center truncate'>
					{url}
				</div>
			</div>
			{/* Scaled preview — always on white so CV text stays readable in dark mode */}
			<div style={{ height, overflow: 'hidden', position: 'relative' }}>
				<div
					className='pointer-events-none origin-top-left bg-white'
					style={{ transform: `scale(${scale})`, width: innerWidth }}
				>
					{children}
				</div>
			</div>
		</div>
	)
}

// ─── Main landing page component ─────────────────────────────────────────────
export function LandingPage() {
	const { user, loading } = useAuthUser()
	const router = useRouter()
	const [activeTemplate, setActiveTemplate] = useState<Template>('modern')

	useEffect(() => {
		if (!loading && user) {
			router.replace('/dashboard')
		}
	}, [user, loading, router])

	if (loading || user) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-white'>
				<div className='w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin' />
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-white dark:bg-slate-950 transition-colors duration-200'>
			{/* ── NAVBAR ── */}
			<nav className='fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16'>
					<div className='flex items-center gap-2'>
						<div className='w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0'>
							<svg
								className='w-4 h-4 text-white'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2.5}
									d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
								/>
							</svg>
						</div>
						<span className='font-bold text-gray-900 dark:text-white text-lg tracking-tight'>
							CVBuilder AI
						</span>
					</div>
					<div className='flex items-center gap-1'>
						<ThemeToggle />
						<Link
							href='/login'
							className='text-sm text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-colors'
						>
							Log in
						</Link>
						<Link
							href='/register'
							className='text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors shadow-sm'
						>
							Get Started Free
						</Link>
					</div>
				</div>
			</nav>

			{/* ── HERO ── */}
			<section className='relative pt-24 pb-24 px-4 overflow-hidden bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900'>
				{/* Ambient blobs */}
				<div className='absolute inset-0 overflow-hidden pointer-events-none' aria-hidden>
					<div className='absolute -top-40 -right-32 w-162.5 h-162.5 bg-indigo-600/20 rounded-full blur-3xl animate-pulse' />
					<div className='absolute -bottom-32 -left-32 w-125 h-125 bg-purple-600/15 rounded-full blur-3xl animate-pulse [animation-delay:1.5s]' />
					<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 bg-indigo-800/10 rounded-full blur-3xl' />
				</div>

				<div className='relative max-w-7xl mx-auto'>
					<div className='flex flex-col lg:flex-row items-center gap-12 lg:gap-20'>
						{/* Copy */}
						<div className='flex-1 text-center lg:text-left max-w-xl'>
							<div className='inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-indigo-200 mb-6'>
								<span className='w-2 h-2 bg-green-400 rounded-full shrink-0 animate-pulse' />
								AI-Powered Resume Builder
							</div>
							<h1 className='text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-5'>
								Build a CV that
								<br />
								<span className='bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent'>
									gets you hired
								</span>
							</h1>
							<p className='text-lg text-slate-300 leading-relaxed mb-8'>
								Create a professional, ATS-friendly CV in minutes. Let AI enhance your content,
								choose from 3 stunning templates, and download a perfect PDF instantly.
							</p>
							<div className='flex flex-col sm:flex-row gap-3 justify-center lg:justify-start'>
								<Link
									href='/register'
									className='inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base shadow-lg shadow-indigo-500/30'
								>
									Create your CV — free
									<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M17 8l4 4m0 0l-4 4m4-4H3'
										/>
									</svg>
								</Link>
								<Link
									href='/login'
									className='inline-flex items-center justify-center text-slate-300 hover:text-white font-medium px-6 py-3.5 rounded-xl border border-white/10 hover:border-white/30 transition-colors text-base'
								>
									Log in
								</Link>
							</div>
							<p className='mt-4 text-xs text-slate-500'>
								No credit card required · Free forever plan
							</p>
						</div>

						{/* Hero CV mockup */}
						<div className='flex-1 w-full max-w-120'>
							<BrowserMockup url='cvbuilder.ai/preview' height={360} scale={0.58}>
								<ModernPreview data={DEMO_CV} />
							</BrowserMockup>
						</div>
					</div>
				</div>
			</section>

			{/* ── STATS ── */}
			<section className='py-12 border-b border-gray-100 dark:border-slate-800 dark:bg-slate-950'>
				<div className='max-w-5xl mx-auto px-4'>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
						{[
							{ value: '10,000+', label: 'CVs Created' },
							{ value: '3', label: 'Pro Templates' },
							{ value: '< 15 min', label: 'Avg Build Time' },
							{ value: '1-click', label: 'AI Enhancement' },
						].map(s => (
							<div key={s.label}>
								<p className='text-3xl font-extrabold text-indigo-600 tracking-tight'>{s.value}</p>
								<p className='text-sm text-gray-500 dark:text-slate-400 mt-1'>{s.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── HOW IT WORKS ── */}
			<section className='py-20 px-4 dark:bg-slate-950'>
				<div className='max-w-5xl mx-auto'>
					<div className='text-center mb-14'>
						<p className='text-indigo-600 font-semibold text-xs uppercase tracking-widest mb-2'>
							How it works
						</p>
						<h2 className='text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white'>
							From blank page to hired — 3 steps
						</h2>
					</div>
					<div className='grid md:grid-cols-3 gap-6'>
						{[
							{
								step: '01',
								title: 'Fill in your details',
								desc: 'Use our guided form to enter your experience, education, skills, and projects. No formatting required — we handle it.',
								icon: (
									<svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={1.8}
											d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
										/>
									</svg>
								),
							},
							{
								step: '02',
								title: 'Let AI enhance it',
								desc: 'One click rewrites your summary and bullets to be more impactful, quantified, and optimized for ATS systems.',
								icon: (
									<svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={1.8}
											d='M13 10V3L4 14h7v7l9-11h-7z'
										/>
									</svg>
								),
							},
							{
								step: '03',
								title: 'Export your PDF',
								desc: 'Pick your template, preview in real-time, and download a clean ATS-friendly PDF that stands out.',
								icon: (
									<svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={1.8}
											d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
										/>
									</svg>
								),
							},
						].map(item => (
							<div
								key={item.step}
								className='relative p-7 rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-100 dark:hover:border-indigo-700 hover:shadow-xl hover:shadow-indigo-50/60 dark:hover:shadow-indigo-950/30 transition-all duration-200'
							>
								<div className='absolute top-4 right-5 text-7xl font-black text-gray-50 dark:text-slate-700 select-none leading-none'>
									{item.step}
								</div>
								<div className='w-12 h-12 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-5 relative z-10'>
									{item.icon}
								</div>
								<h3 className='font-bold text-gray-900 dark:text-white mb-2 relative z-10'>
									{item.title}
								</h3>
								<p className='text-sm text-gray-500 dark:text-slate-400 leading-relaxed relative z-10'>
									{item.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── AI LIVE DEMO ── */}
			<section className='py-20 px-4 bg-gray-50 dark:bg-slate-900'>
				<div className='max-w-4xl mx-auto'>
					<div className='text-center mb-12'>
						<p className='text-indigo-600 font-semibold text-xs uppercase tracking-widest mb-2'>
							Live Demo
						</p>
						<h2 className='text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white'>
							Watch AI transform your CV
						</h2>
						<p className='mt-3 text-gray-500 dark:text-slate-400 max-w-md mx-auto text-sm'>
							This is exactly what happens when you click “Improve with AI” inside the builder.
						</p>
					</div>
					<AIDemoWidget />
				</div>
			</section>

			{/* ── TEMPLATES ── */}
			<section className='py-20 px-4 bg-gray-50 dark:bg-slate-900'>
				<div className='max-w-4xl mx-auto'>
					<div className='text-center mb-12'>
						<p className='text-indigo-600 font-semibold text-xs uppercase tracking-widest mb-2'>
							Templates
						</p>
						<h2 className='text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white'>
							3 stunning designs. One perfect fit.
						</h2>
						<p className='mt-3 text-gray-500 dark:text-slate-400 max-w-md mx-auto text-sm'>
							Switch templates instantly — your content moves with you, no re-entering required.
						</p>
					</div>

					{/* Tabs */}
					<div className='flex justify-center gap-2 mb-8'>
						{TEMPLATES.map(t => (
							<button
								key={t.id}
								onClick={() => setActiveTemplate(t.id)}
								className={`px-6 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
									activeTemplate === t.id
										? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
										: 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:text-indigo-600 border border-gray-200 dark:border-slate-700 hover:border-indigo-200'
								}`}
							>
								{t.label}
							</button>
						))}
					</div>

					{/* Preview */}
					<BrowserMockup
						url={`cvbuilder.ai/preview — ${activeTemplate.charAt(0).toUpperCase() + activeTemplate.slice(1)} Template`}
						height={520}
						scale={0.68}
					>
						{activeTemplate === 'modern' && <ModernPreview data={DEMO_CV} />}
						{activeTemplate === 'classic' && <ClassicPreview data={DEMO_CV} />}
						{activeTemplate === 'minimal' && <MinimalPreview data={DEMO_CV} />}
					</BrowserMockup>
				</div>
			</section>

			{/* ── FEATURES ── */}
			<section className='py-20 px-4 dark:bg-slate-950'>
				<div className='max-w-5xl mx-auto'>
					<div className='text-center mb-14'>
						<p className='text-indigo-600 font-semibold text-xs uppercase tracking-widest mb-2'>
							Features
						</p>
						<h2 className='text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white'>
							Everything you need to stand out
						</h2>
					</div>
					<div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5'>
						{FEATURES.map(f => (
							<div
								key={f.title}
								className='p-6 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-700 hover:shadow-xl hover:shadow-indigo-50/60 dark:hover:shadow-indigo-950/30 transition-all duration-200 bg-white dark:bg-slate-800'
							>
								<div className='w-10 h-10 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-4'>
									{f.icon}
								</div>
								<h3 className='font-bold text-gray-900 dark:text-white mb-1.5 text-sm'>
									{f.title}
								</h3>
								<p className='text-sm text-gray-500 dark:text-slate-400 leading-relaxed'>
									{f.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── PRICING ── */}
			<section className='py-20 px-4 bg-gray-50 dark:bg-slate-900'>
				<div className='max-w-4xl mx-auto'>
					<div className='text-center mb-14'>
						<p className='text-indigo-600 font-semibold text-xs uppercase tracking-widest mb-2'>
							Pricing
						</p>
						<h2 className='text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white'>
							Simple, transparent pricing
						</h2>
						<p className='mt-3 text-gray-500 dark:text-slate-400'>
							Start free. Upgrade when you&apos;re ready.
						</p>
					</div>
					<div className='grid md:grid-cols-2 gap-6 max-w-2xl mx-auto'>
						{/* Free */}
						<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-8'>
							<p className='text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3'>
								Free
							</p>
							<div className='flex items-end gap-1 mb-1'>
								<span className='text-4xl font-extrabold text-gray-900 dark:text-white'>$0</span>
								<span className='text-gray-400 dark:text-slate-500 text-sm mb-1'>/month</span>
							</div>
							<p className='text-sm text-gray-400 dark:text-slate-500 mb-7'>
								Forever free · No credit card
							</p>
							<ul className='space-y-3 mb-8'>
								{[
									'Unlimited CVs',
									'3 professional templates',
									'Live preview',
									'Auto-save',
									'PDF export (watermarked)',
									'Version history',
								].map(item => (
									<li
										key={item}
										className='flex items-center gap-2.5 text-sm text-gray-700 dark:text-slate-300'
									>
										<svg
											className='w-4 h-4 text-green-500 shrink-0'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2.5}
												d='M5 13l4 4L19 7'
											/>
										</svg>
										{item}
									</li>
								))}
							</ul>
							<Link
								href='/register'
								className='block w-full text-center py-3 rounded-xl border-2 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-semibold hover:border-indigo-300 hover:text-indigo-600 transition-colors text-sm'
							>
								Get started free
							</Link>
						</div>

						{/* Pro */}
						<div className='relative bg-indigo-600 rounded-2xl p-8 text-white overflow-hidden'>
							<div className='absolute top-5 right-5 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full z-10'>
								POPULAR
							</div>
							{/* Decorative circles */}
							<div className='absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full' />
							<div className='absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full' />
							<p className='text-xs font-bold text-indigo-200 uppercase tracking-widest mb-3 relative z-10'>
								Pro
							</p>
							<div className='flex items-end gap-1 mb-1 relative z-10'>
								<span className='text-4xl font-extrabold'>$9</span>
								<span className='text-indigo-200 text-sm mb-1'>/month</span>
							</div>
							<p className='text-sm text-indigo-200 mb-7 relative z-10'>
								Everything in Free, plus:
							</p>
							<ul className='space-y-3 mb-8 relative z-10'>
								{[
									'Clean PDF — no watermark',
									'Unlimited AI improvements',
									'Priority support',
									'Early access to new features',
								].map(item => (
									<li key={item} className='flex items-center gap-2.5 text-sm'>
										<svg
											className='w-4 h-4 text-indigo-200 shrink-0'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2.5}
												d='M5 13l4 4L19 7'
											/>
										</svg>
										{item}
									</li>
								))}
							</ul>
							<Link
								href='/register'
								className='relative z-10 block w-full text-center py-3 rounded-xl bg-white text-indigo-700 font-semibold hover:bg-indigo-50 transition-colors text-sm'
							>
								Start with Pro — $9/mo
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* ── TESTIMONIALS ── */}
			<section className='py-20 px-4 dark:bg-slate-950'>
				<div className='max-w-5xl mx-auto'>
					<div className='text-center mb-14'>
						<p className='text-indigo-600 font-semibold text-xs uppercase tracking-widest mb-2'>
							Testimonials
						</p>
						<h2 className='text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white'>
							Loved by job seekers worldwide
						</h2>
					</div>
					<div className='grid md:grid-cols-3 gap-6'>
						{TESTIMONIALS.map(t => (
							<div
								key={t.name}
								className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/60 transition-all duration-200'
							>
								<div className='flex gap-0.5 mb-4'>
									{Array.from({ length: t.rating }).map((_, i) => (
										<svg
											key={i}
											className='w-4 h-4 fill-yellow-400 text-yellow-400'
											viewBox='0 0 20 20'
										>
											<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
										</svg>
									))}
								</div>
								<p className='text-gray-700 dark:text-slate-300 text-sm leading-relaxed mb-5'>
									&ldquo;{t.text}&rdquo;
								</p>
								<div className='flex items-center gap-3'>
									<div className='w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0'>
										{t.avatar}
									</div>
									<div>
										<p className='font-semibold text-gray-900 dark:text-white text-sm'>{t.name}</p>
										<p className='text-xs text-gray-500 dark:text-slate-400'>{t.role}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── FAQ ── */}
			<section className='py-20 px-4 bg-gray-50 dark:bg-slate-900'>
				<div className='max-w-2xl mx-auto'>
					<div className='text-center mb-12'>
						<p className='text-indigo-600 font-semibold text-xs uppercase tracking-widest mb-2'>
							FAQ
						</p>
						<h2 className='text-3xl font-bold text-gray-900 dark:text-white'>Common questions</h2>
					</div>
					<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 px-6 shadow-sm'>
						{FAQS.map(faq => (
							<FAQItem key={faq.q} q={faq.q} a={faq.a} />
						))}
					</div>
				</div>
			</section>

			{/* ── BOTTOM CTA ── */}
			<section className='py-24 px-4 bg-linear-to-r from-indigo-600 to-purple-600 relative overflow-hidden'>
				<div className='absolute inset-0 pointer-events-none' aria-hidden>
					<div className='absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full' />
					<div className='absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full' />
				</div>
				<div className='relative max-w-3xl mx-auto text-center'>
					<h2 className='text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight'>
						Ready to land your next role?
					</h2>
					<p className='text-indigo-100 text-lg mb-10'>
						Join thousands of professionals who built their CV in minutes.
					</p>
					<Link
						href='/register'
						className='inline-flex items-center gap-2.5 bg-white text-indigo-700 font-bold px-10 py-4 rounded-xl text-base hover:bg-indigo-50 transition-colors shadow-2xl shadow-indigo-900/30'
					>
						Build your CV — it&apos;s free
						<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M17 8l4 4m0 0l-4 4m4-4H3'
							/>
						</svg>
					</Link>
					<p className='mt-4 text-indigo-200 text-sm'>No credit card required</p>
				</div>
			</section>

			{/* ── FOOTER ── */}
			<footer className='py-10 px-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950'>
				<div className='max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4'>
					<div className='flex items-center gap-2'>
						<div className='w-6 h-6 bg-indigo-600 rounded flex items-center justify-center shrink-0'>
							<svg
								className='w-3 h-3 text-white'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2.5}
									d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
								/>
							</svg>
						</div>
						<span className='font-semibold text-gray-700 dark:text-slate-300 text-sm'>
							CVBuilder AI
						</span>
					</div>
					<p className='text-sm text-gray-400 dark:text-slate-500'>
						© {new Date().getFullYear()} CVBuilder AI. All rights reserved.
					</p>
					<div className='flex gap-6 text-sm text-gray-500 dark:text-slate-400'>
						<Link href='/login' className='hover:text-indigo-600 transition-colors'>
							Log in
						</Link>
						<Link href='/register' className='hover:text-indigo-600 transition-colors'>
							Sign up
						</Link>
					</div>
				</div>
			</footer>
		</div>
	)
}
