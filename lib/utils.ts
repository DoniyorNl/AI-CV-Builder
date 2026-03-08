import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
	if (!dateStr) return ''
	const date = new Date(dateStr)
	return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function generateId(): string {
	return crypto.randomUUID()
}

/** User-friendly message for Firebase Auth errors (e.g. account-exists-with-different-credential). */
export function getAuthErrorMessage(err: unknown): string {
	const msg = err instanceof Error ? err.message : String(err)
	const code = (err as { code?: string })?.code ?? ''
	if (code === 'auth/account-exists-with-different-credential' || msg.includes('account-exists-with-different-credential')) {
		return "This email is already used with another sign-in method (e.g. Email/Password or Google). Please sign in with the method you used when you first created your account."
	}
	if (msg.includes('popup-closed-by-user') || msg.includes('cancelled-popup-request')) return ''
	return msg.replace(/Firebase:\s*/i, '').replace(/\s*\(auth\/[^)]*\)\.?/, '').trim() || 'Sign in failed'
}
