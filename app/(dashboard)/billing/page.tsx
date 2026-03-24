'use client'

import { useSubscription } from '@/hooks/useSubscription'
import { PLANS } from '@/lib/stripe'
import { Check, Loader2, Zap } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function BillingPage() {
	const { data: sub, isLoading } = useSubscription()
	const [checkoutLoading, setCheckoutLoading] = useState(false)

	const handleUpgrade = async () => {
		setCheckoutLoading(true)
		try {
			const res = await fetch('/api/stripe/checkout', { method: 'POST' })
			if (!res.ok) throw new Error('Failed to create checkout session')
			const { url } = (await res.json()) as { url: string }
			window.location.href = url
		} catch {
			toast.error('Failed to start checkout. Please try again.')
			setCheckoutLoading(false)
		}
	}

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-24'>
				<Loader2 className='w-6 h-6 animate-spin text-gray-400' />
			</div>
		)
	}

	return (
		<div className='max-w-3xl mx-auto'>
			<div className='text-center mb-10'>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Choose your plan</h1>
				<p className='text-gray-500 dark:text-slate-400 mt-2'>
					Unlock PDF downloads and more with Pro
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				{/* Free Plan */}
				<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-7'>
					<div className='mb-5'>
						<h2 className='text-xl font-bold text-gray-900 dark:text-white'>{PLANS.free.name}</h2>
						<div className='mt-2'>
							<span className='text-4xl font-bold text-gray-900 dark:text-white'>$0</span>
							<span className='text-gray-400 dark:text-slate-500 ml-1'>/month</span>
						</div>
					</div>

					<ul className='space-y-3 mb-7'>
						{PLANS.free.features.map(f => (
							<li
								key={f}
								className='flex items-center gap-2.5 text-sm text-gray-600 dark:text-slate-300'
							>
								<Check className='w-4 h-4 text-green-500 shrink-0' />
								{f}
							</li>
						))}
						<li className='flex items-center gap-2.5 text-sm text-red-400'>
							<span className='w-4 h-4 shrink-0 text-center font-bold'>✕</span>
							{PLANS.free.limit}
						</li>
					</ul>

					<div className='border border-gray-200 dark:border-slate-600 rounded-xl py-2.5 text-center text-sm text-gray-500 dark:text-slate-400'>
						{sub?.isPro ? 'Previous plan' : 'Current plan'}
					</div>
				</div>

				{/* Pro Plan */}
				<div className='bg-indigo-600 rounded-2xl p-7 relative overflow-hidden'>
					{/* Glow */}
					<div className='absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full -translate-y-16 translate-x-16 opacity-50' />

					<div className='relative mb-5'>
						<div className='flex items-center gap-2 mb-1'>
							<h2 className='text-xl font-bold text-white'>{PLANS.pro.name}</h2>
							<span className='bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium'>
								RECOMMENDED
							</span>
						</div>
						<div className='mt-2'>
							<span className='text-4xl font-bold text-white'>${PLANS.pro.price}</span>
							<span className='text-indigo-200 ml-1'>/month</span>
						</div>
					</div>

					<ul className='space-y-3 mb-7 relative'>
						{PLANS.pro.features.map(f => (
							<li key={f} className='flex items-center gap-2.5 text-sm text-indigo-100'>
								<Check className='w-4 h-4 text-white shrink-0' />
								{f}
							</li>
						))}
					</ul>

					{sub?.isPro ? (
						<div className='bg-white/20 rounded-xl py-2.5 text-center text-sm text-white font-medium relative'>
							✓ Active Plan
						</div>
					) : (
						<button
							onClick={handleUpgrade}
							disabled={checkoutLoading}
							className='relative w-full bg-white text-indigo-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-50 transition disabled:opacity-70 flex items-center justify-center gap-2'
						>
							{checkoutLoading ? (
								<Loader2 className='w-4 h-4 animate-spin' />
							) : (
								<Zap className='w-4 h-4' />
							)}
							Upgrade to Pro
						</button>
					)}
				</div>
			</div>

			<p className='text-center text-xs text-gray-400 dark:text-slate-500 mt-6'>
				Secure payment via Stripe · Cancel anytime · No hidden fees
			</p>
		</div>
	)
}
