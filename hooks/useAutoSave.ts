'use client'

import { useCallback, useEffect, useRef } from 'react'

/**
 * Debounced auto-save hook.
 * Calls `saveFn` 1 second after the last change.
 * Shows a "saving…" indicator via the optional callbacks.
 */
export function useAutoSave<T>(
	value: T,
	saveFn: (value: T) => Promise<void>,
	options: {
		delay?: number
		onSaving?: () => void
		onSaved?: () => void
		onError?: (err: unknown) => void
		enabled?: boolean
	} = {},
) {
	const { delay = 1000, onSaving, onSaved, onError, enabled = true } = options

	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const isMountedRef = useRef(false)
	const saveFnRef = useRef(saveFn)

	// keep saveFn ref fresh without re-triggering the effect
	saveFnRef.current = saveFn

	useEffect(() => {
		if (!enabled) return
		// skip the very first render
		if (!isMountedRef.current) {
			isMountedRef.current = true
			return
		}

		if (timerRef.current) clearTimeout(timerRef.current)

		timerRef.current = setTimeout(async () => {
			onSaving?.()
			try {
				await saveFnRef.current(value)
				onSaved?.()
			} catch (err) {
				onError?.(err)
			}
		}, delay)

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value, delay, enabled])

	/** Flush save immediately (e.g. on page leave) */
	const flush = useCallback(async () => {
		if (timerRef.current) {
			clearTimeout(timerRef.current)
			timerRef.current = null
		}
		onSaving?.()
		try {
			await saveFnRef.current(value)
			onSaved?.()
		} catch (err) {
			onError?.(err)
		}
	}, [value, onSaving, onSaved, onError])

	return { flush }
}
