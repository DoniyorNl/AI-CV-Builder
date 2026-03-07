import type { CVData } from '@/types/cv.types'

interface Props {
	data: CVData
}

export function MinimalPreview({ data }: Props) {
	const { personal, summary, experience, education, skills, projects } = data

	return (
		<div className='font-serif text-sm px-10 py-8 max-w-2xl leading-relaxed'>
			{/* Header */}
			<div className='border-b-2 border-gray-900 pb-4 mb-6'>
				<h1 className='text-3xl font-bold text-gray-900 tracking-tight'>
					{personal.full_name || 'Your Name'}
				</h1>
				<div className='flex flex-wrap gap-x-3 mt-1.5 text-xs text-gray-500'>
					{personal.email && <span>{personal.email}</span>}
					{personal.phone && <span>· {personal.phone}</span>}
					{personal.city && <span>· {personal.city}</span>}
					{personal.linkedin && <span>· {personal.linkedin}</span>}
				</div>
			</div>

			{summary.text && (
				<section className='mb-5'>
					<p className='text-gray-700 text-xs leading-relaxed italic'>{summary.text}</p>
				</section>
			)}

			{experience.length > 0 && (
				<section className='mb-5'>
					<h2 className='text-xs font-bold uppercase tracking-widest text-gray-400 mb-3'>
						Work Experience
					</h2>
					{experience.map(exp => (
						<div key={exp.id} className='mb-4'>
							<div className='flex justify-between'>
								<div>
									<span className='font-bold text-gray-900'>{exp.position}</span>
									<span className='text-gray-500'> — {exp.company}</span>
								</div>
								<span className='text-xs text-gray-400'>
									{exp.start_date} – {exp.current ? 'Present' : exp.end_date}
								</span>
							</div>
							{exp.bullets.length > 0 && (
								<ul className='mt-1 space-y-0.5 list-disc list-inside'>
									{exp.bullets.map((b, i) => (
										<li key={i} className='text-gray-600 text-xs'>
											{b}
										</li>
									))}
								</ul>
							)}
						</div>
					))}
				</section>
			)}

			{education.length > 0 && (
				<section className='mb-5'>
					<h2 className='text-xs font-bold uppercase tracking-widest text-gray-400 mb-3'>
						Education
					</h2>
					{education.map(e => (
						<div key={e.id} className='mb-2 flex justify-between'>
							<div>
								<span className='font-bold text-gray-900'>{e.degree}</span>
								<span className='text-gray-500'> in {e.field}</span>
								<p className='text-xs text-gray-500'>{e.institution}</p>
							</div>
							<span className='text-xs text-gray-400'>
								{e.start_year} – {e.end_year}
							</span>
						</div>
					))}
				</section>
			)}

			{(skills.technical.length > 0 || skills.soft.length > 0) && (
				<section className='mb-5'>
					<h2 className='text-xs font-bold uppercase tracking-widest text-gray-400 mb-2'>Skills</h2>
					<p className='text-xs text-gray-600'>
						{[...skills.technical, ...skills.soft].join(' · ')}
					</p>
				</section>
			)}

			{projects.length > 0 && (
				<section>
					<h2 className='text-xs font-bold uppercase tracking-widest text-gray-400 mb-3'>
						Projects
					</h2>
					{projects.map(p => (
						<div key={p.id} className='mb-2'>
							<span className='font-bold text-gray-900'>{p.name}</span>
							{p.link && <span className='text-gray-400 text-xs ml-1'>— {p.link}</span>}
							<p className='text-xs text-gray-600'>{p.description}</p>
						</div>
					))}
				</section>
			)}
		</div>
	)
}
