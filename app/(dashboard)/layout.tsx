import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { adminDB } from '@/lib/firebase/admin'
import { getServerUser } from '@/lib/firebase/session'
import { CreditCard, FileText, History, LogOut, Settings } from 'lucide-react'
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
		<div className='min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200'>
			{/* Topbar */}
			<header className='bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50'>
				<div className='max-w-7xl mx-auto px-4 h-16 flex items-center justify-between'>
					{/* Left: Logo + Nav */}
					<div className='flex items-center gap-6'>
						<Link href='/dashboard' className='flex items-center gap-2 shrink-0'>
							<FileText className='w-6 h-6 text-indigo-600' />
							<span className='font-bold text-gray-900 dark:text-white'>AI CV Builder</span>
						</Link>
						<nav className='hidden sm:flex items-center gap-1'>
						<Link
							href='/dashboard'
							className='px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition'
						>
							Dashboard
						</Link>
						<Link
							href='/history'
							className='px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5'
						>
								<History className='w-3.5 h-3.5' />
								History
							</Link>
						</nav>
					</div>

					{/* Right: Pro badge/Upgrade + User + Settings + Logout */}
					<div className='flex items-center gap-3'>
						{profile?.is_pro ? (
							<span className='bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full'>
								PRO
							</span>
						) : (
							<Link
								href='/billing'
								className='bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition flex items-center gap-1.5'
							>
								<CreditCard className='w-3.5 h-3.5' />
								<span className='hidden sm:inline'>Upgrade to Pro</span>
								<span className='sm:hidden'>Pro</span>
							</Link>
						)}

						<span className='text-sm text-gray-600 dark:text-slate-400 hidden md:inline'>
							{profile?.full_name ?? user.email}
						</span>

						<ThemeToggle />

						<Link
							href='/settings'
							className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition text-gray-500 dark:text-slate-400'
							title='Settings'
						>
							<Settings className='w-4 h-4' />
						</Link>

						<form action='/auth/signout' method='post'>
							<button
								type='submit'
								className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition text-gray-500 dark:text-slate-400'
								title='Sign out'
							>
								<LogOut className='w-4 h-4' />
							</button>
						</form>
					</div>
				</div>
			</header>

			<main className='max-w-7xl mx-auto px-4 py-8'>{children}</main>
		</div>
	)
}
