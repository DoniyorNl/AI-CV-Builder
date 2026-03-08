'use client'

import { auth, db } from '@/lib/firebase/client'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AuthCredential } from 'firebase/auth'
import {
	createUserWithEmailAndPassword,
	fetchSignInMethodsForEmail,
	GithubAuthProvider,
	GoogleAuthProvider,
	linkWithCredential,
	signInWithEmailAndPassword,
	signInWithPopup,
	updateProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { FileText, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { getAuthErrorMessage } from '@/lib/utils'
import { toast } from 'sonner'
import { z } from 'zod'

const ACCOUNT_EXISTS_CODE = 'auth/account-exists-with-different-credential'

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

async function createSession(idToken: string): Promise<void> {
	const res = await fetch('/api/auth/session', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ idToken }),
	})
	if (!res.ok) {
		const data = await res.json().catch(() => ({}))
		throw new Error((data as { error?: string }).error ?? res.statusText)
	}
}

export default function RegisterPage() {
	const [loading, setLoading] = useState(false)
	const [linkPassword, setLinkPassword] = useState('')
	const [linkPasswordLoading, setLinkPasswordLoading] = useState(false)
	const [pendingLink, setPendingLink] = useState<{
		credential: AuthCredential
		email: string
		methods: string[]
		newProviderName: string
	} | null>(null)
	const router = useRouter()

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

	async function finishSignIn(user: { uid: string; email: string | null; displayName: string | null; getIdToken: () => Promise<string> }) {
		await setDoc(
			doc(db, 'users', user.uid),
			{
				full_name: user.displayName ?? user.email ?? '',
				email: user.email ?? '',
				is_pro: false,
				stripe_customer_id: null,
				created_at: serverTimestamp(),
			},
			{ merge: true },
		)
		const idToken = await user.getIdToken()
		await createSession(idToken)
		setPendingLink(null)
		router.push('/dashboard')
	}

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
			let user = credential.user
			if (pendingLink) {
				await linkWithCredential(user, pendingLink.credential)
				user = auth.currentUser!
			}
			await finishSignIn(user)
		} catch (err: unknown) {
			const e = err as { code?: string; customData?: { email?: string }; credential?: AuthCredential; email?: string }
			const email = e?.customData?.email ?? e?.email
			if (e?.code === ACCOUNT_EXISTS_CODE && e?.credential && email) {
				const methods = await fetchSignInMethodsForEmail(auth, email)
				setPendingLink({
					credential: e.credential,
					email,
					methods,
					newProviderName: 'Google',
				})
				toast.info('This email is already registered. Sign in with your existing method below to link your Google account.')
			} else {
				const msg = getAuthErrorMessage(err)
				if (msg) toast.error(msg)
			}
		} finally {
			setLoading(false)
		}
	}

	const handleGitHubSignup = async () => {
		setLoading(true)
		try {
			const provider = new GithubAuthProvider()
			const credential = await signInWithPopup(auth, provider)
			let user = credential.user
			if (pendingLink) {
				await linkWithCredential(user, pendingLink.credential)
				user = auth.currentUser!
			}
			await finishSignIn(user)
		} catch (err: unknown) {
			const e = err as { code?: string; customData?: { email?: string }; credential?: AuthCredential; email?: string }
			const email = e?.customData?.email ?? e?.email
			if (e?.code === ACCOUNT_EXISTS_CODE && e?.credential && email) {
				const methods = await fetchSignInMethodsForEmail(auth, email)
				setPendingLink({
					credential: e.credential,
					email,
					methods,
					newProviderName: 'GitHub',
				})
				toast.info('This email is already registered. Sign in with your existing method below to link your GitHub account.')
			} else {
				const msg = getAuthErrorMessage(err)
				if (msg) toast.error(msg)
			}
		} finally {
			setLoading(false)
		}
	}

	const handleLinkWithPassword = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!pendingLink || !linkPassword.trim()) return
		setLinkPasswordLoading(true)
		try {
			const credential = await signInWithEmailAndPassword(auth, pendingLink.email, linkPassword)
			await linkWithCredential(credential.user, pendingLink.credential)
			await finishSignIn(auth.currentUser!)
		} catch (err: unknown) {
			toast.error(getAuthErrorMessage(err) || 'Wrong password or account not found.')
		} finally {
			setLinkPasswordLoading(false)
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
					{pendingLink && (
						<div className='mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl'>
							<p className='text-sm text-amber-800 font-medium mb-1'>Link your account</p>
							<p className='text-sm text-amber-700 mb-3'>
								{pendingLink.email} is already registered. Sign in with your existing method to add {pendingLink.newProviderName}.
							</p>
							{pendingLink.methods.includes('password') && (
								<form onSubmit={handleLinkWithPassword} className='space-y-2 mb-3'>
									<input
										type='email'
										value={pendingLink.email}
										readOnly
										className='w-full border border-amber-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700'
									/>
									<input
										type='password'
										value={linkPassword}
										onChange={e => setLinkPassword(e.target.value)}
										placeholder='Your password'
										className='w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
									/>
									<div className='flex gap-2'>
										<button
											type='submit'
											disabled={linkPasswordLoading}
											className='flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-60'
										>
											{linkPasswordLoading && <Loader2 className='w-4 h-4 animate-spin' />}
											Link and sign in
										</button>
										<button
											type='button'
											onClick={() => { setPendingLink(null); setLinkPassword('') }}
											className='px-3 py-2 text-sm text-amber-700 hover:bg-amber-100 rounded-lg'
										>
											Cancel
										</button>
									</div>
								</form>
							)}
							{!pendingLink.methods.includes('password') && (
								<p className='text-sm text-amber-700 mb-2'>Sign in with the same method you used when you first registered:</p>
							)}
							{pendingLink.methods.includes('google.com') && (
								<button
									type='button'
									onClick={handleGoogleSignup}
									disabled={loading}
									className='w-full mb-2 flex items-center justify-center gap-2 border border-amber-300 rounded-lg px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100'
								>
									{loading ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Sign in with Google to link'}
								</button>
							)}
							{pendingLink.methods.includes('github.com') && (
								<button
									type='button'
									onClick={handleGitHubSignup}
									disabled={loading}
									className='w-full flex items-center justify-center gap-2 border border-amber-300 rounded-lg px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100'
								>
									{loading ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Sign in with GitHub to link'}
								</button>
							)}
							{!pendingLink.methods.includes('password') && (
								<button
									type='button'
									onClick={() => setPendingLink(null)}
									className='mt-2 w-full px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 rounded-lg'
								>
									Cancel
								</button>
							)}
						</div>
					)}

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

					{/* GitHub sign up */}
					<button
						onClick={handleGitHubSignup}
						disabled={loading}
						className='w-full mt-3 flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-60'
					>
						{loading ? (
							<Loader2 className='w-4 h-4 animate-spin' />
						) : (
							<svg className='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'>
								<path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
							</svg>
						)}
						Continue with GitHub
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
