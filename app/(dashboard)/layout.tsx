import { adminDB } from '@/lib/firebase/admin'
import { getServerUser } from '@/lib/firebase/session'
import { CreditCard, FileText, LogOut } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

// Dashboard pages require auth — always render dynamically
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const user = await getServerUser()
	if (!user) redirect('/login')

	let profile: { full_name?: string; is_pro?: boolean } | undefined
	try {
		const profileSnap = await adminDB().collection('users').doc(user.uid).get()
		profile = profileSnap.data() as typeof profile
	} catch {
		// Firestore may not be ready yet or the document doesn't exist — continue with defaults
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Topbar */}
			<header className='bg-white border-b border-gray-200 sticky top-0 z-50'>
				<div className='max-w-7xl mx-auto px-4 h-16 flex items-center justify-between'>
					<Link href='/dashboard' className='flex items-center gap-2'>
						<FileText className='w-6 h-6 text-indigo-600' />
						<span className='font-bold text-gray-900'>AI CV Builder</span>
					</Link>

					<div className='flex items-center gap-4'>
						{profile?.is_pro ? (
							<span className='bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full'>
								PRO
							</span>
						) : (
							<Link
								href='/billing'
								className='bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition flex items-center gap-1.5'
							>
								<CreditCard className='w-3.5 h-3.5' />
								Upgrade to Pro
							</Link>
						)}

						<div className='flex items-center gap-2'>
							<span className='text-sm text-gray-600'>{profile?.full_name ?? user.email}</span>
							<form action='/auth/signout' method='post'>
								<button
									type='submit'
									className='p-2 rounded-lg hover:bg-gray-100 transition text-gray-500'
									title='Sign out'
								>
									<LogOut className='w-4 h-4' />
								</button>
							</form>
						</div>
					</div>
				</div>
			</header>

			<main className='max-w-7xl mx-auto px-4 py-8'>{children}</main>
		</div>
	)
}
