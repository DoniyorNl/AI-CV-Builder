'use client'

import { useSubscription } from '@/hooks/useSubscription'
import { useAuthUser } from '@/lib/firebase/auth-provider'
import { db } from '@/lib/firebase/client'
import { sendPasswordResetEmail, updateProfile } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { AlertTriangle, CheckCircle2, CreditCard, Loader2, Lock, Trash2, User2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function SettingsPage() {
	const { user } = useAuthUser()
	const { data: sub } = useSubscription()
	const router = useRouter()

	const [name, setName] = useState('')
	const [nameLoading, setNameLoading] = useState(false)
	const [resetLoading, setResetLoading] = useState(false)
	const [deleteLoading, setDeleteLoading] = useState(false)
	const [deleteConfirm, setDeleteConfirm] = useState('')

	// Load display name from Firestore on mount
	useEffect(() => {
		if (!user) return
		if (user.displayName) {
			setName(user.displayName)
			return
		}
		getDoc(doc(db, 'users', user.uid)).then(snap => {
			if (snap.exists()) setName((snap.data().full_name as string) ?? '')
		})
	}, [user])

	const handleSaveName = async () => {
		if (!user || !name.trim()) return
		setNameLoading(true)
		try {
			const { auth } = await import('@/lib/firebase/client')
			await updateProfile(auth.currentUser!, { displayName: name.trim() })
			await updateDoc(doc(db, 'users', user.uid), { full_name: name.trim() })
			toast.success('Profil yangilandi!')
		} catch {
			toast.error('Profilni yangilashda xatolik.')
		} finally {
			setNameLoading(false)
		}
	}

	const handlePasswordReset = async () => {
		if (!user?.email) return
		setResetLoading(true)
		try {
			const { auth } = await import('@/lib/firebase/client')
			await sendPasswordResetEmail(auth, user.email)
			toast.success(`Parol tiklash havolasi ${user.email} ga yuborildi`)
		} catch {
			toast.error('Email yuborishda xatolik.')
		} finally {
			setResetLoading(false)
		}
	}

	const handleDeleteAccount = async () => {
		if (deleteConfirm !== 'DELETE' || !user) return
		setDeleteLoading(true)
		try {
			await user.delete()
			toast.success("Hisob o'chirildi.")
			router.push('/')
		} catch (err) {
			const error = err as { code?: string }
			if (error.code === 'auth/requires-recent-login') {
				toast.error("Hisobni o'chirish uchun avval chiqib, qayta kiring.")
			} else {
				toast.error("Hisobni o'chirishda xatolik. Iltimos qaytadan urinib ko'ring.")
			}
		} finally {
			setDeleteLoading(false)
		}
	}

	if (!user) {
		return (
			<div className='flex items-center justify-center py-24'>
				<Loader2 className='w-6 h-6 animate-spin text-gray-400' />
			</div>
		)
	}

	return (
		<div className='max-w-2xl mx-auto space-y-6'>
			{/* Page Title */}
			<div>
				<h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Sozlamalar</h1>
				<p className='text-gray-500 dark:text-slate-400 text-sm mt-1'>
					Hisob va sozlamalaringizni boshqaring
				</p>
			</div>

			{/* ── Profile ───────────────────────────────────── */}
			<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6'>
				<div className='flex items-center gap-3 mb-5'>
					<div className='w-9 h-9 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center'>
						<User2 className='w-4 h-4 text-indigo-600' />
					</div>
					<h2 className='font-semibold text-gray-900 dark:text-white'>Profil</h2>
				</div>

				<div className='space-y-4'>
					{/* Full name */}
					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5'>
							To&#39;liq ism
						</label>
						<div className='flex gap-3'>
							<input
								type='text'
								value={name}
								onChange={e => setName(e.target.value)}
								className='flex-1 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:text-white dark:placeholder-slate-400'
								placeholder="To'liq ismingiz"
							/>
							<button
								onClick={handleSaveName}
								disabled={nameLoading || !name.trim()}
								className='bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
							>
								{nameLoading ? (
									<Loader2 className='w-4 h-4 animate-spin' />
								) : (
									<CheckCircle2 className='w-4 h-4' />
								)}
								Saqlash
							</button>
						</div>
					</div>

					{/* Email (read-only) */}
					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5'>
							Email
						</label>
						<input
							type='email'
							value={user.email ?? ''}
							disabled
							className='w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-700/50 text-gray-400 dark:text-slate-500 cursor-not-allowed'
						/>
						<p className='text-xs text-gray-400 dark:text-slate-500 mt-1'>Email o&#39;zgartirilmaydi</p>
					</div>
				</div>
			</div>

			{/* ── Security ──────────────────────────────────── */}
			<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6'>
				<div className='flex items-center gap-3 mb-5'>
					<div className='w-9 h-9 bg-blue-50 dark:bg-blue-900/40 rounded-xl flex items-center justify-center'>
						<Lock className='w-4 h-4 text-blue-600' />
					</div>
					<h2 className='font-semibold text-gray-900 dark:text-white'>Xavfsizlik</h2>
				</div>

				<div className='flex items-center justify-between'>
					<div>
						<p className='text-sm font-medium text-gray-700 dark:text-slate-300'>Parolni tiklash</p>
						<p className='text-xs text-gray-400 dark:text-slate-500 mt-0.5'>
							{user.email} ga havolani yuboradi
						</p>
					</div>
					<button
						onClick={handlePasswordReset}
						disabled={resetLoading}
						className='border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl px-4 py-2 text-sm font-medium transition flex items-center gap-2 disabled:opacity-50'
					>
						{resetLoading && <Loader2 className='w-4 h-4 animate-spin' />}
						Parolni tiklash
					</button>
				</div>
			</div>

			{/* ── Billing ───────────────────────────────────── */}
			<div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6'>
				<div className='flex items-center gap-3 mb-5'>
					<div className='w-9 h-9 bg-emerald-50 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center'>
						<CreditCard className='w-4 h-4 text-emerald-600' />
					</div>
					<h2 className='font-semibold text-gray-900 dark:text-white'>Billing</h2>
				</div>

				<div className='flex items-center justify-between'>
					<div>
						<p className='text-sm font-medium text-gray-700 dark:text-slate-300'>Joriy reja</p>
						<div className='flex items-center gap-2 mt-1'>
							{sub?.isPro ? (
								<span className='bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full'>
									PRO
								</span>
							) : (
								<span className='bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs font-semibold px-2.5 py-1 rounded-full'>
									FREE
								</span>
							)}
							<span className='text-xs text-gray-400 dark:text-slate-500'>
								{sub?.isPro ? '$9/oylik' : 'Bepul'}
							</span>
						</div>
					</div>
					<Link
						href='/billing'
						className='border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl px-4 py-2 text-sm font-medium transition'
					>
						{sub?.isPro ? 'Obunani boshqarish' : "Pro'ga o'tish"}
					</Link>
				</div>
			</div>

			{/* ── Danger Zone ───────────────────────────────── */}
			<div className='bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-900/60 p-6'>
				<div className='flex items-center gap-3 mb-5'>
					<div className='w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center'>
						<AlertTriangle className='w-4 h-4 text-red-500' />
					</div>
					<h2 className='font-semibold text-red-600'>Xavfli zona</h2>
				</div>

				<p className='text-sm text-gray-600 dark:text-slate-400 mb-4'>
					Hisobingizni va barcha CV ma&#39;lumotlaringizni butunlay o&#39;chirib tashlaydi. Bu amalni{' '}
					<strong>qaytarib bo&#39;lmaydi</strong>.
				</p>

				<div className='space-y-3'>
					<div>
						<label className='block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5'>
							Tasdiqlash uchun <strong className='text-red-500'>DELETE</strong> yozing
						</label>
						<input
							type='text'
							value={deleteConfirm}
							onChange={e => setDeleteConfirm(e.target.value)}
							className='w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white dark:bg-slate-700 dark:text-white dark:placeholder-slate-400'
							placeholder='DELETE'
						/>
					</div>
					<button
						onClick={handleDeleteAccount}
						disabled={deleteConfirm !== 'DELETE' || deleteLoading}
						className='w-full bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl px-4 py-2.5 text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed'
					>
						{deleteLoading ? (
							<Loader2 className='w-4 h-4 animate-spin' />
						) : (
							<Trash2 className='w-4 h-4' />
						)}
						Hisobni o&#39;chirish
					</button>
				</div>
			</div>
		</div>
	)
}
