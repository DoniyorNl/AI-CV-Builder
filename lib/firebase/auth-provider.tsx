'use client'

import { auth } from '@/lib/firebase/client'
import type { User } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextValue {
	user: User | null
	/** true until Firebase resolves the initial auth state */
	loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, resolvedUser => {
			setUser(resolvedUser)
			setLoading(false)
		})
		return unsubscribe
	}, [])

	return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

/** Returns the current Firebase user and loading state. */
export function useAuthUser(): AuthContextValue {
	return useContext(AuthContext)
}
