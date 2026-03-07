'use client'

import type { PersonalInfo } from '@/types/cv.types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
	full_name: z.string().min(1),
	email: z.string().email(),
	phone: z.string(),
	city: z.string(),
	linkedin: z.string().optional(),
	website: z.string().optional(),
})

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
	const {
		register,
		watch,
		formState: { errors },
	} = useForm<PersonalInfo>({
		resolver: zodResolver(schema),
		defaultValues: data,
	})

	useEffect(() => {
		const sub = watch(values => onChange(values as PersonalInfo))
		return () => sub.unsubscribe()
	}, [watch, onChange])

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
			{fields.map(({ name, label, placeholder, type }) => (
				<div key={name} className={name === 'full_name' ? 'sm:col-span-2' : ''}>
					<label className='block text-sm font-medium text-gray-700 mb-1'>{label}</label>
					<input
						type={type ?? 'text'}
						{...register(name)}
						placeholder={placeholder}
						className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
					/>
					{errors[name] && <p className='text-red-500 text-xs mt-1'>{errors[name]?.message}</p>}
				</div>
			))}
		</div>
	)
}
