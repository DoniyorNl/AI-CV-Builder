import { createClient } from '@/lib/supabase/server'
import type { CV } from '@/types/cv.types'
import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'
import { CVCard } from './CVCard'

export default async function DashboardPage() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	const { data: cvs } = await supabase
		.from('cvs')
		.select('*')
		.eq('user_id', user!.id)
		.order('updated_at', { ascending: false })

	const cvList = (cvs ?? []) as CV[]

	return (
		<div>
			{/* Header */}
			<div className='flex items-center justify-between mb-8'>
				<div>
					<h1 className='text-2xl font-bold text-gray-900'>My CVs</h1>
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
