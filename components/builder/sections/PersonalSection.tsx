'use client'

import { VoiceMicButton } from '@/components/ui/VoiceMicButton'
import type { PersonalInfo } from '@/types/cv.types'

interface Props {
	data: PersonalInfo
	onChange: (v: PersonalInfo) => void
}

const fields: Array<{
	name: keyof PersonalInfo
	label: string
	placeholder: string
	type?: string
}> = [
	{ name: 'full_name', label: 'Full Name', placeholder: 'John Doe' },
	{ name: 'email', label: 'Email', placeholder: 'john@example.com', type: 'email' },
	{ name: 'phone', label: 'Phone', placeholder: '+1 234 567 890' },
	{ name: 'city', label: 'City / Location', placeholder: 'San Francisco, CA' },
	{ name: 'linkedin', label: 'LinkedIn URL', placeholder: 'linkedin.com/in/johndoe' },
	{ name: 'website', label: 'Website / Portfolio', placeholder: 'johndoe.dev' },
]

export function PersonalSection({ data, onChange }: Props) {
	const update = (name: keyof PersonalInfo, value: string) => onChange({ ...data, [name]: value })

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
			{fields.map(({ name, label, placeholder, type }) => (
				<div key={name} className={name === 'full_name' ? 'sm:col-span-2' : ''}>
					<label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1'>
						{label}
					</label>
					<div className='relative'>
						<input
							type={type ?? 'text'}
							value={data[name] ?? ''}
							onChange={e => update(name, e.target.value)}
							placeholder={placeholder}
							className='w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 pr-9 text-sm dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
						/>
						<VoiceMicButton
							value={data[name] ?? ''}
							onChange={v => update(name, v)}
							className='absolute right-1.5 top-1/2 -translate-y-1/2'
						/>
					</div>
				</div>
			))}
		</div>
	)
}
