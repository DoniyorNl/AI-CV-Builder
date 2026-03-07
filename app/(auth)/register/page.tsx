'use client'

import { auth, db } from '@/lib/firebase/client'
import { zodResolver } from '@hookform/resolvers/zod'
import {
	createUserWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithPopup,
	updateProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
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

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

	const onSubmit = async (data: RegisterForm) => {
		setLoading(true)
		try {
			// Create Firebase Auth user
			const credential = await createUserWithEmailAndPassword(auth, data.email, data.password)
			await updateProfile(credential.user, { displayName: data.full_name })

			// Create Firestore profile doc
			await setDoc(doc(db, 'users', credential.user.uid), {
				full_name: data.full_name,
				email: data.email,
				is_pro: false,
				stripe_customer_id: null,
				created_at: serverTimestamp(),
			})

			// Create server session cookie
			const idToken = await credential.user.getIdToken()
			const res = await fetch('/api/auth/session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idToken }),
			})
			if (!res.ok) throw new Error('Session creation failed')

			router.push('/dashboard')
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Registration failed'
			toast.error(
				msg
					.replace('Firebase: ', '')
					.replace(/\s*\(auth\/.*\)\.?/, '')
					.trim() || 'Registration failed',
			)
		} finally {
			setLoading(false)
		}
	}

	const handleGoogleSignup = async () => {
		setLoading(true)
		try {
			const provider = new GoogleAuthProvider()
			const credential = await signInWithPopup(auth, provider)

			// Upsert profile (idempotent for returning Google users)
			await setDoc(
				doc(db, 'users', credential.user.uid),
				{
					full_name: credential.user.displayName ?? '',
					email: credential.user.email ?? '',
					is_pro: false,
					stripe_customer_id: null,
					created_at: serverTimestamp(),
				},
				{ merge: true },
			)

			const idToken = await credential.user.getIdToken()
			const res = await fetch('/api/auth/session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idToken }),
			})
			if (!res.ok) throw new Error('Session creation failed')

			router.push('/dashboard')
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : ''
			if (!msg.includes('popup-closed-by-user') && !msg.includes('cancelled-popup-request')) {
				toast.error('Google sign up failed. Please try again.')
			}
		} finally {
			setLoading(false)
		}
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
					{/* Google sign up */}
					<button
						onClick={handleGoogleSignup}
						disabled={loading}
						className='w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-60'
					>
						{loading ? (
							<Loader2 className='w-4 h-4 animate-spin' />
						) : (
							<svg className='w-4 h-4' viewBox='0 0 24 24'>
								<path
									fill='#4285F4'
									d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
								/>
								<path
									fill='#34A853'
									d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
								/>
								<path
									fill='#FBBC05'
									d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
								/>
								<path
									fill='#EA4335'
									d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
								/>
							</svg>
						)}
						Continue with Google
					</button>

					<div className='relative my-6'>
						<div className='absolute inset-0 flex items-center'>
							<div className='w-full border-t border-gray-200' />
						</div>
						<div className='relative flex justify-center text-sm'>
							<span className='bg-white px-3 text-gray-400'>or</span>
						</div>
					</div>

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
