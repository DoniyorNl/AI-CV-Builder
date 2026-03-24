import { adminDB } from '@/lib/firebase/admin'
import { getServerUser } from '@/lib/firebase/session'
import type { CV } from '@/types/cv.types'
import { Clock, FileText, LayoutTemplate, Plus, Sparkles, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { CVCard } from './CVCard'

export default async function DashboardPage() {
	const user = await getServerUser()

	let cvList: CV[] = []
	let isPro = false

	try {
		const [cvsSnap, profileSnap] = await Promise.all([
			adminDB()
				.collection('cvs')
				.where('user_id', '==', user!.uid)
				.orderBy('updated_at', 'desc')
				.get(),
			adminDB().collection('users').doc(user!.uid).get(),
		])

		cvList = cvsSnap.docs.map(d => {
			const data = d.data()
			return {
				...data,
				id: d.id,
				created_at: data.created_at?.toDate().toISOString() ?? new Date().toISOString(),
				updated_at: data.updated_at?.toDate().toISOString() ?? new Date().toISOString(),
			} as CV
		})

		isPro = (profileSnap.data()?.is_pro as boolean | undefined) ?? false
	} catch {
		// Firestore may not be ready or collection doesn't exist yet — show empty state
	}

	const publishedCount = cvList.filter(c => c.status === 'published').length
	const lastUpdated =
		cvList.length > 0
			? new Date(cvList[0].updated_at).toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
				})
			: '—'

	const stats = [
		{
			label: 'Total CVs',
			value: cvList.length.toString(),
			icon: <FileText className='w-5 h-5' />,
			color: 'bg-indigo-50 text-indigo-600',
		},
		{
			label: 'Published',
			value: publishedCount.toString(),
			icon: <TrendingUp className='w-5 h-5' />,
			color: 'bg-green-50 text-green-600',
		},
		{
			label: 'Plan',
			value: isPro ? 'Pro' : 'Free',
			icon: <Sparkles className='w-5 h-5' />,
			color: isPro ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-500',
			badge: !isPro,
		},
		{
			label: 'Last Activity',
			value: lastUpdated,
			icon: <Clock className='w-5 h-5' />,
			color: 'bg-purple-50 text-purple-600',
		},
	]

	return (
		<div>
			{/* Header */}
			<div className='flex items-center justify-between mb-6'>
				<div>
					<h1 className='text-2xl font-bold text-gray-900 dark:text-white'>My CVs</h1>
					<p className='text-gray-500 text-sm mt-1'>
						{cvList.length} CV{cvList.length !== 1 ? 's' : ''} created
					</p>
				</div>
				<Link
					href='/builder/new'
					className='bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition flex items-center gap-2'
				>
					<Plus className='w-4 h-4' />
					New CV
				</Link>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
				{stats.map(stat => (
					<div
						key={stat.label}
						className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 flex items-center gap-4 shadow-sm'
					>
						<div
							className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}
						>
							{stat.icon}
						</div>
						<div className='min-w-0'>
							<p className='text-xs text-gray-400 dark:text-slate-500 font-medium'>{stat.label}</p>
							<div className='flex items-center gap-1.5 mt-0.5'>
								<p className='text-xl font-bold text-gray-900 dark:text-white truncate'>
									{stat.value}
								</p>
								{'badge' in stat && stat.badge && (
									<Link
										href='/billing'
										className='text-[10px] font-semibold bg-indigo-600 text-white px-1.5 py-0.5 rounded-full hover:bg-indigo-700 transition shrink-0'
									>
										Upgrade
									</Link>
								)}
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Templates quick-access */}
			<div className='flex items-center gap-2 mb-6 text-sm text-gray-500 dark:text-slate-400'>
				<LayoutTemplate className='w-4 h-4 shrink-0' />
				<span>Available templates:</span>
				{['modern', 'classic', 'minimal'].map(t => (
					<span key={t} className='capitalize font-medium text-gray-700 dark:text-slate-300'>
						{t}
					</span>
				))}
			</div>

			{/* CV Grid */}
			{cvList.length === 0 ? (
				<div className='text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl bg-white'>
					<FileText className='w-12 h-12 text-gray-300 mx-auto mb-4' />
					<h3 className='text-lg font-semibold text-gray-700 mb-2'>No CVs yet</h3>
					<p className='text-gray-400 text-sm mb-6'>Create your first AI-powered CV in minutes</p>
					<Link
						href='/builder/new'
						className='bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition inline-flex items-center gap-2'
					>
						<Plus className='w-4 h-4' />
						Create your first CV
					</Link>
				</div>
			) : (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
					{cvList.map(cv => (
						<CVCard key={cv.id} cv={cv} />
					))}
				</div>
			)}
		</div>
	)
}
