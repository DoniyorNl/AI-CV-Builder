'use client'

import { auth } from '@/lib/firebase/client'
import type { User } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import Link from 'next/link'
import { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextValue {
	user: User | null
	/** true until Firebase resolves the initial auth state */
	loading: boolean
	/** set when Firebase config is missing or invalid (e.g. invalid-api-key) */
	configError: string | null
}

const AuthContext = createContext<AuthContextValue>({
	user: null,
	loading: true,
	configError: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const [configError, setConfigError] = useState<string | null>(null)

	useEffect(() => {
		let unsubscribe: (() => void) | undefined
		try {
			unsubscribe = onAuthStateChanged(auth, resolvedUser => {
				setUser(resolvedUser)
				setLoading(false)
				setConfigError(null)
			})
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err)
			const isInvalidKey =
				message.includes('invalid-api-key') || message.includes('auth/invalid-api-key')
			const isUnconfigured = message.includes('Firebase is not configured')
			const errorMsg =
				isInvalidKey || isUnconfigured
					? 'Firebase is not configured or API key is invalid. Set NEXT_PUBLIC_FIREBASE_API_KEY (and other NEXT_PUBLIC_FIREBASE_* vars) in .env.local or Vercel Environment Variables.'
					: message
			setTimeout(() => {
				setConfigError(errorMsg)
				setLoading(false)
			}, 0)
		}
		return () => unsubscribe?.()
	}, [])

	if (configError) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
				<div className='max-w-md text-center space-y-4'>
					<h1 className='text-xl font-semibold text-gray-900'>Firebase configuration required</h1>
					<p className='text-sm text-gray-600'>{configError}</p>
					<p className='text-xs text-gray-500'>
						Local: add to <code className='bg-gray-200 px-1 rounded'>.env.local</code>. Production:
						Vercel → Project → Settings → Environment Variables.
					</p>
					<Link
						href='/'
						className='inline-block border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium'
					>
						Go home
					</Link>
				</div>
			</div>
		)
	}

	return (
		<AuthContext.Provider value={{ user, loading, configError }}>{children}</AuthContext.Provider>
	)
}

/** Returns the current Firebase user and loading state. */
export function useAuthUser(): AuthContextValue {
	return useContext(AuthContext)
}
