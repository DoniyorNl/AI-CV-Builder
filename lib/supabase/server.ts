import type { Database } from '@/types/database.types'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
	const cookieStore = await cookies()

	return createServerClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll()
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options),
						)
					} catch {
						// setAll called from Server Component — cookies can't be mutated,
						// but the middleware will handle session refresh.
					}
				},
			},
		},
	)
}

/** Service-role client — bypasses RLS. Use ONLY in trusted server contexts (webhooks, admin). */
export async function createServiceClient() {
	const cookieStore = await cookies()

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return createServerClient<any>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll()
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options),
						)
					} catch {
						// ignore
					}
				},
			},
		},
	)
}
