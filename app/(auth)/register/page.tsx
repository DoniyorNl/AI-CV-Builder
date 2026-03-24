'use client'

import { useAuthUser } from '@/lib/firebase/auth-provider'
import { auth, db } from '@/lib/firebase/client'
import { getAuthErrorMessage } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import {
	createUserWithEmailAndPassword,
	GithubAuthProvider,
	GoogleAuthProvider,
	linkWithCredential,
	signInWithPopup,
	updateProfile,
	type AuthCredential,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { FileText, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
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
	const [googleLoading, setGoogleLoading] = useState(false)
	const [githubLoading, setGithubLoading] = useState(false)
	const router = useRouter()
	const { user, loading: authLoading } = useAuthUser()

	useEffect(() => {
		if (!authLoading && user) {
			router.replace('/dashboard')
		}
	}, [authLoading, user, router])

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

	async function finishSignIn(user: {
		uid: string
		email: string | null
		displayName: string | null
		getIdToken: () => Promise<string>
	}) {
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
		router.push('/dashboard')
	}

	/** Try auto-linking: sign in with the other OAuth provider, then link the pending credential */
	async function autoLinkWithProvider(
		pendingCredential: AuthCredential,
		providerToTry: 'google' | 'github',
	): Promise<boolean> {
		try {
			const provider =
				providerToTry === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider()
			toast.info(
				`Signing in with ${providerToTry === 'google' ? 'Google' : 'GitHub'} to link your accounts...`,
			)
			const result = await signInWithPopup(auth, provider)
			await linkWithCredential(result.user, pendingCredential)
			await finishSignIn(auth.currentUser!)
			toast.success('Accounts linked successfully!')
			return true
		} catch {
			return false
		}
	}

	const onSubmit = async (data: RegisterForm) => {
		setLoading(true)
		try {
			const credential = await createUserWithEmailAndPassword(auth, data.email, data.password)
			await updateProfile(credential.user, { displayName: data.full_name })

			await setDoc(doc(db, 'users', credential.user.uid), {
				full_name: data.full_name,
				email: data.email,
				is_pro: false,
				stripe_customer_id: null,
				created_at: serverTimestamp(),
			})

			const idToken = await credential.user.getIdToken()
			const res = await fetch('/api/auth/session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idToken }),
			})
			if (!res.ok) throw new Error('Session creation failed')

			router.push('/dashboard')
		} catch (err: unknown) {
			const code = (err as { code?: string })?.code ?? ''
			if (code === 'auth/email-already-in-use') {
				toast.error(
					'This email is already registered. Go to Sign in, or use Google/GitHub buttons above.',
				)
			} else {
				const msg = getAuthErrorMessage(err)
				toast.error(msg || 'Registration failed')
			}
		} finally {
			setLoading(false)
		}
	}

	const handleGoogleSignup = async () => {
		setGoogleLoading(true)
		try {
			const provider = new GoogleAuthProvider()
			const credential = await signInWithPopup(auth, provider)
			await finishSignIn(credential.user)
		} catch (err: unknown) {
			const e = err as { code?: string; customData?: { email?: string } }
			const email = e?.customData?.email
			const oauthCredential = GoogleAuthProvider.credentialFromError(
				err as Parameters<typeof GoogleAuthProvider.credentialFromError>[0],
			)
			if (e?.code === ACCOUNT_EXISTS_CODE && oauthCredential && email) {
				const linked = await autoLinkWithProvider(oauthCredential, 'github')
				if (!linked) {
					toast.error(
						'Could not auto-link. Try signing in with GitHub manually, then try Google again.',
					)
				}
			} else {
				const msg = getAuthErrorMessage(err)
				if (msg) toast.error(msg)
			}
		} finally {
			setGoogleLoading(false)
		}
	}

	const handleGitHubSignup = async () => {
		setGithubLoading(true)
		try {
			const provider = new GithubAuthProvider()
			const credential = await signInWithPopup(auth, provider)
			await finishSignIn(credential.user)
		} catch (err: unknown) {
			const e = err as { code?: string; customData?: { email?: string } }
			const email = e?.customData?.email
			const oauthCredential = GithubAuthProvider.credentialFromError(
				err as Parameters<typeof GithubAuthProvider.credentialFromError>[0],
			)
			if (e?.code === ACCOUNT_EXISTS_CODE && oauthCredential && email) {
				const linked = await autoLinkWithProvider(oauthCredential, 'google')
				if (!linked) {
					toast.error(
						'Could not auto-link. Try signing in with Google manually, then try GitHub again.',
					)
				}
			} else {
				const msg = getAuthErrorMessage(err)
				if (msg) toast.error(msg)
			}
		} finally {
			setGithubLoading(false)
		}
	}

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center px-4'>
			<div className='w-full max-w-md'>
				<div className='text-center mb-8'>
					<div className='inline-flex items-center gap-2 mb-2'>
						<FileText className='w-8 h-8 text-indigo-600' />
						<span className='text-2xl font-bold text-gray-900 dark:text-white'>AI CV Builder</span>
					</div>
					<p className='text-gray-500 dark:text-slate-400'>Create your free account</p>
				</div>

				<div className='bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-8'>
					{/* Google sign up */}
					<button
						onClick={handleGoogleSignup}
						disabled={googleLoading}
						className='w-full flex items-center justify-center gap-3 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition disabled:opacity-60'
					>
						{googleLoading ? (
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
						disabled={githubLoading}
						className='w-full mt-3 flex items-center justify-center gap-3 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition disabled:opacity-60'
					>
						{githubLoading ? (
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
							<div className='w-full border-t border-gray-200 dark:border-slate-700' />
						</div>
						<div className='relative flex justify-center text-sm'>
							<span className='bg-white dark:bg-slate-800 px-3 text-gray-400 dark:text-slate-500'>
								or
							</span>
						</div>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1'>
								Full Name
							</label>
							<input
								{...register('full_name')}
								className='w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
								placeholder='John Doe'
							/>
							{errors.full_name && (
								<p className='text-red-500 text-xs mt-1'>{errors.full_name.message}</p>
							)}
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1'>
								Email
							</label>
							<input
								type='email'
								{...register('email')}
								className='w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
								placeholder='you@example.com'
							/>
							{errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email.message}</p>}
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1'>
								Password
							</label>
							<input
								type='password'
								{...register('password')}
								className='w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
								placeholder='••••••••'
							/>
							{errors.password && (
								<p className='text-red-500 text-xs mt-1'>{errors.password.message}</p>
							)}
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1'>
								Confirm Password
							</label>
							<input
								type='password'
								{...register('confirm_password')}
								className='w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
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

					<p className='text-center text-sm text-gray-500 dark:text-slate-400 mt-6'>
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
