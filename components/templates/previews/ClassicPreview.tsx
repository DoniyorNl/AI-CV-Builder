import type { CVData } from '@/types/cv.types'

interface Props {
	data: CVData
}

export function ClassicPreview({ data }: Props) {
	const { personal, summary, experience, education, skills, projects } = data

	return (
		<div className='font-sans text-sm px-8 py-7 max-w-2xl leading-relaxed'>
			{/* Header */}
			<div className='text-center border-b border-gray-300 pb-4 mb-6'>
				<h1 className='text-2xl font-bold text-gray-900 uppercase tracking-wide'>
					{personal.full_name || 'Your Name'}
				</h1>
				<div className='flex flex-wrap justify-center gap-x-3 mt-1 text-xs text-gray-600'>
					{personal.email && <span>{personal.email}</span>}
					{personal.phone && <span>| {personal.phone}</span>}
					{personal.city && <span>| {personal.city}</span>}
					{personal.linkedin && <span>| {personal.linkedin}</span>}
				</div>
			</div>

			{summary.text && (
				<section className='mb-5'>
					<h2 className='text-xs font-bold uppercase border-b border-gray-300 pb-1 mb-2 text-gray-800'>
						Professional Summary
					</h2>
					<p className='text-gray-700 text-xs leading-relaxed'>{summary.text}</p>
				</section>
			)}

			{experience.length > 0 && (
				<section className='mb-5'>
					<h2 className='text-xs font-bold uppercase border-b border-gray-300 pb-1 mb-3 text-gray-800'>
						Work Experience
					</h2>
					{experience.map(exp => (
						<div key={exp.id} className='mb-3'>
							<div className='flex justify-between items-baseline'>
								<p className='font-bold text-gray-900'>
									{exp.position}, {exp.company}
								</p>
								<p className='text-xs text-gray-500'>
									{exp.start_date} – {exp.current ? 'Present' : exp.end_date}
								</p>
							</div>
							{exp.bullets.length > 0 && (
								<ul className='mt-1 space-y-0.5'>
									{exp.bullets.map((b, i) => (
										<li key={i} className='text-gray-700 text-xs flex gap-1.5'>
											<span>•</span>
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
					<h2 className='text-xs font-bold uppercase border-b border-gray-300 pb-1 mb-3 text-gray-800'>
						Education
					</h2>
					{education.map(e => (
						<div key={e.id} className='flex justify-between'>
							<div>
								<p className='font-bold text-gray-900'>{e.institution}</p>
								<p className='text-xs text-gray-600'>
									{e.degree}, {e.field}
								</p>
							</div>
							<p className='text-xs text-gray-500'>
								{e.start_year} – {e.end_year}
							</p>
						</div>
					))}
				</section>
			)}

			{(skills.technical.length > 0 || skills.soft.length > 0) && (
				<section className='mb-5'>
					<h2 className='text-xs font-bold uppercase border-b border-gray-300 pb-1 mb-2 text-gray-800'>
						Skills
					</h2>
					{skills.technical.length > 0 && (
						<p className='text-xs text-gray-700'>
							<strong>Technical:</strong> {skills.technical.join(', ')}
						</p>
					)}
					{skills.soft.length > 0 && (
						<p className='text-xs text-gray-700'>
							<strong>Soft:</strong> {skills.soft.join(', ')}
						</p>
					)}
				</section>
			)}

			{projects.length > 0 && (
				<section>
					<h2 className='text-xs font-bold uppercase border-b border-gray-300 pb-1 mb-3 text-gray-800'>
						Projects
					</h2>
					{projects.map(p => (
						<div key={p.id} className='mb-2'>
							<p className='font-bold text-gray-900'>
								{p.name}
								{p.link && (
									<span className='font-normal text-gray-500 text-xs ml-1'>— {p.link}</span>
								)}
							</p>
							<p className='text-xs text-gray-700'>{p.description}</p>
							{p.technologies.length > 0 && (
								<p className='text-xs text-gray-500'>Technologies: {p.technologies.join(', ')}</p>
							)}
						</div>
					))}
				</section>
			)}
		</div>
	)
}
