'use client'

import { createClient } from '@/lib/supabase/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const registerSchema = z
	.object({
		full_name: z.string().min(2, 'Name must be at least 2 characters'),
		email: z.string().email('Enter a valid email'),
		password: z.string().min(6, 'Password must be at least 6 characters'),
		confirm_password: z.string(),
	})
	.refine(d => d.password === d.confirm_password, {
		message: "Passwords don't match",
		path: ['confirm_password'],
	})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
	const [loading, setLoading] = useState(false)
	const router = useRouter()
	const supabase = createClient()

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

	const onSubmit = async (data: RegisterForm) => {
		setLoading(true)
		const { error } = await supabase.auth.signUp({
			email: data.email,
			password: data.password,
			options: {
				data: { full_name: data.full_name },
			},
		})
		setLoading(false)

		if (error) {
			toast.error(error.message)
			return
		}

		toast.success('Account created! Please check your email to confirm.')
		router.push('/login')
	}

	return (
		<div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
			<div className='w-full max-w-md'>
				<div className='text-center mb-8'>
					<div className='inline-flex items-center gap-2 mb-2'>
						<FileText className='w-8 h-8 text-indigo-600' />
						<span className='text-2xl font-bold text-gray-900'>AI CV Builder</span>
					</div>
					<p className='text-gray-500'>Create your free account</p>
				</div>

				<div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8'>
					<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>Full Name</label>
							<input
								{...register('full_name')}
								className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
								placeholder='John Doe'
							/>
							{errors.full_name && (
								<p className='text-red-500 text-xs mt-1'>{errors.full_name.message}</p>
							)}
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
							<input
								type='email'
								{...register('email')}
								className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
								placeholder='you@example.com'
							/>
							{errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email.message}</p>}
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
							<input
								type='password'
								{...register('password')}
								className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
								placeholder='••••••••'
							/>
							{errors.password && (
								<p className='text-red-500 text-xs mt-1'>{errors.password.message}</p>
							)}
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Confirm Password
							</label>
							<input
								type='password'
								{...register('confirm_password')}
								className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
								placeholder='••••••••'
							/>
							{errors.confirm_password && (
								<p className='text-red-500 text-xs mt-1'>{errors.confirm_password.message}</p>
							)}
						</div>

						<button
							type='submit'
							disabled={loading}
							className='w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:opacity-60 flex items-center justify-center gap-2'
						>
							{loading && <Loader2 className='w-4 h-4 animate-spin' />}
							Create Account
						</button>
					</form>

					<p className='text-center text-sm text-gray-500 mt-6'>
						Already have an account?{' '}
						<Link href='/login' className='text-indigo-600 hover:underline font-medium'>
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
