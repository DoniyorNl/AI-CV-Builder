'use client'

import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'

const supabase = createClient()

export function useSubscription() {
	return useQuery({
		queryKey: ['subscription'],
		queryFn: async () => {
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser()
			if (userError || !user) return { isPro: false }

			const { data: profile } = await supabase
				.from('profiles')
				.select('is_pro')
				.eq('id', user.id)
				.single()

			return { isPro: profile?.is_pro ?? false }
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	})
}
