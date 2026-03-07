import type { CVData, ExperienceItem } from '@/types/cv.types'

interface Props {
	data: CVData
}

export function ModernPreview({ data }: Props) {
	const { personal, summary, experience, education, skills, projects } = data

	return (
		<div className='font-sans text-sm leading-relaxed'>
			{/* Header */}
			<div className='bg-linear-to-r from-indigo-600 to-purple-600 text-white px-8 py-7'>
				<h1 className='text-2xl font-bold'>{personal.full_name || 'Your Name'}</h1>
				<div className='flex flex-wrap gap-x-4 gap-y-1 mt-2 text-indigo-100 text-xs'>
					{personal.email && <span>{personal.email}</span>}
					{personal.phone && <span>{personal.phone}</span>}
					{personal.city && <span>{personal.city}</span>}
					{personal.linkedin && <span>{personal.linkedin}</span>}
				</div>
			</div>

			<div className='flex gap-0'>
				{/* Main column */}
				<div className='flex-1 px-8 py-6 space-y-6 min-w-0'>
					{summary.text && (
						<section>
							<h2 className='text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2'>
								Summary
							</h2>
							<p className='text-gray-700 text-xs leading-relaxed'>{summary.text}</p>
						</section>
					)}

					{experience.length > 0 && (
						<section>
							<h2 className='text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3'>
								Experience
							</h2>
							<div className='space-y-4'>
								{experience.map((exp: ExperienceItem) => (
									<div key={exp.id}>
										<div className='flex justify-between items-start'>
											<div>
												<p className='font-semibold text-gray-900'>{exp.position}</p>
												<p className='text-indigo-600 text-xs'>{exp.company}</p>
											</div>
											<p className='text-xs text-gray-400 shrink-0 ml-2'>
												{exp.start_date} — {exp.current ? 'Present' : exp.end_date}
											</p>
										</div>
										{exp.bullets.length > 0 && (
											<ul className='mt-1.5 space-y-1'>
												{exp.bullets.map((b, i) => (
													<li key={i} className='text-gray-600 text-xs flex gap-1.5'>
														<span className='text-indigo-400 mt-0.5'>•</span>
														{b}
													</li>
												))}
											</ul>
										)}
									</div>
								))}
							</div>
						</section>
					)}

					{projects.length > 0 && (
						<section>
							<h2 className='text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3'>
								Projects
							</h2>
							<div className='space-y-3'>
								{projects.map(p => (
									<div key={p.id}>
										<div className='flex items-center gap-2'>
											<p className='font-semibold text-gray-900 text-xs'>{p.name}</p>
											{p.link && (
												<a href={p.link} className='text-indigo-500 text-xs hover:underline'>
													{p.link}
												</a>
											)}
										</div>
										<p className='text-gray-600 text-xs mt-0.5'>{p.description}</p>
										{p.technologies.length > 0 && (
											<div className='flex flex-wrap gap-1 mt-1'>
												{p.technologies.map(t => (
													<span
														key={t}
														className='bg-indigo-50 text-indigo-600 text-xs px-1.5 py-0.5 rounded'
													>
														{t}
													</span>
												))}
											</div>
										)}
									</div>
								))}
							</div>
						</section>
					)}
				</div>

				{/* Sidebar */}
				<div className='w-44 shrink-0 bg-gray-50 px-5 py-6 space-y-5'>
					{education.length > 0 && (
						<section>
							<h2 className='text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2'>
								Education
							</h2>
							{education.map(e => (
								<div key={e.id} className='mb-2'>
									<p className='font-semibold text-gray-900 text-xs'>{e.institution}</p>
									<p className='text-gray-600 text-xs'>
										{e.degree} in {e.field}
									</p>
									<p className='text-gray-400 text-xs'>
										{e.start_year} — {e.end_year}
									</p>
								</div>
							))}
						</section>
					)}

					{(skills.technical.length > 0 || skills.soft.length > 0) && (
						<section>
							<h2 className='text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2'>
								Skills
							</h2>
							{skills.technical.length > 0 && (
								<div className='mb-2'>
									<p className='text-xs font-medium text-gray-500 mb-1'>Technical</p>
									<div className='flex flex-wrap gap-1'>
										{skills.technical.map(s => (
											<span
												key={s}
												className='bg-indigo-100 text-indigo-700 text-xs px-1.5 py-0.5 rounded'
											>
												{s}
											</span>
										))}
									</div>
								</div>
							)}
							{skills.soft.length > 0 && (
								<div>
									<p className='text-xs font-medium text-gray-500 mb-1'>Soft</p>
									<div className='flex flex-wrap gap-1'>
										{skills.soft.map(s => (
											<span
												key={s}
												className='bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded'
											>
												{s}
											</span>
										))}
									</div>
								</div>
							)}
						</section>
					)}
				</div>
			</div>
		</div>
	)
}
