export default function BuilderLoading() {
	return (
		<div className='flex gap-6 h-[calc(100vh-8rem)] animate-pulse'>
			{/* Sidebar skeleton */}
			<aside className='w-56 shrink-0 space-y-1'>
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className='h-10 bg-gray-200 rounded-xl' />
				))}
			</aside>

			{/* Form area skeleton */}
			<div className='flex-1 bg-white rounded-2xl border border-gray-200 p-6 space-y-5'>
				<div className='h-6 w-40 bg-gray-200 rounded' />
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className='space-y-2'>
						<div className='h-4 w-24 bg-gray-100 rounded' />
						<div className='h-10 w-full bg-gray-100 rounded-lg' />
					</div>
				))}
			</div>

			{/* Preview skeleton */}
			<div className='w-95 shrink-0 bg-gray-100 rounded-2xl' />
		</div>
	)
}
