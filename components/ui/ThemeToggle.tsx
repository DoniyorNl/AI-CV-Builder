'use client'

import { useTheme } from '@/lib/theme'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle({ className }: { className?: string }) {
	const { theme, toggle } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => { setTimeout(() => setMounted(true), 0) }, [])

	return (
		<button
			onClick={toggle}
			aria-label={mounted && theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
			className={`p-2 rounded-lg transition-colors text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer ${className ?? ''}`}
		>
			{mounted && theme === 'dark' ? (
				<Sun className='w-4 h-4 text-yellow-400' />
			) : (
				<Moon className='w-4 h-4' />
			)}
		</button>
	)
}
