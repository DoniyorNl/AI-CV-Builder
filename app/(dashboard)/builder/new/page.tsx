'use client'

import { useCreateCV } from '@/hooks/useCV'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Loader2, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
	title: z.string().min(2, 'Title must be at least 2 characters').max(80),
})

export default function NewCVPage() {
	const { mutate: createCV, isPending } = useCreateCV()

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<{ title: string }>({
		resolver: zodResolver(schema),
		defaultValues: { title: 'My CV' },
	})

	return (
		<div className='max-w-lg mx-auto'>
			<div className='text-center mb-8'>
				<div className='w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
					<Sparkles className='w-7 h-7 text-indigo-600' />
				</div>
				<h1 className='text-2xl font-bold text-gray-900'>Create New CV</h1>
				<p className='text-gray-500 text-sm mt-2'>
					Give your CV a name to get started. You can change it later.
				</p>
			</div>

			<div className='bg-white rounded-2xl border border-gray-200 p-8'>
				<form onSubmit={handleSubmit(d => createCV(d.title))} className='space-y-5'>
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1.5'>CV Title</label>
						<input
							{...register('title')}
							className='w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
							placeholder='e.g. Software Engineer CV, Senior Designer Resume...'
						/>
						{errors.title && <p className='text-red-500 text-xs mt-1'>{errors.title.message}</p>}
					</div>

					<button
						type='submit'
						disabled={isPending}
						className='w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-3 text-sm font-medium transition disabled:opacity-60 flex items-center justify-center gap-2'
					>
						{isPending ? (
							<>
								<Loader2 className='w-4 h-4 animate-spin' />
								Creating...
							</>
						) : (
							<>
								<FileText className='w-4 h-4' />
								Create CV
							</>
						)}
					</button>
				</form>
			</div>
		</div>
	)
}
