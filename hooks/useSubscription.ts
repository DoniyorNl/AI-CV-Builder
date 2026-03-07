'use client'

import { useAuthUser } from '@/lib/firebase/auth-provider'
import { db } from '@/lib/firebase/client'
import { useQuery } from '@tanstack/react-query'
import { doc, getDoc } from 'firebase/firestore'

export function useSubscription() {
	const { user } = useAuthUser()

	return useQuery({
		queryKey: ['subscription'],
		enabled: !!user,
		queryFn: async () => {
			const snap = await getDoc(doc(db, 'users', user!.uid))
			if (!snap.exists()) return { isPro: false }
			return { isPro: (snap.data().is_pro as boolean) ?? false }
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	})
}
