'use client'

import { AuthProvider } from '@/lib/firebase/auth-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000, // 1 minute
						retry: 1,
					},
				},
			}),
	)

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				{children}
				<Toaster richColors position='top-right' />
			</AuthProvider>
		</QueryClientProvider>
	)
}
