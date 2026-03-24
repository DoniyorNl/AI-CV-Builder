'use client'

import { useSpeechInput } from '@/hooks/useSpeechInput'
import { cn } from '@/lib/utils'
import { Mic, Square } from 'lucide-react'
import { useCallback, useRef } from 'react'

interface VoiceMicButtonProps {
	/**
	 * Current value of the target field.
	 * Used as the base text when appending voice transcript,
	 * so speaking doesn't wipe out what's already typed.
	 */
	value: string
	/** Receives the updated field value on every transcript (interim + final). */
	onChange: (value: string) => void
	className?: string
	/** Override speech recognition language. Defaults to browser language. */
	lang?: string
}

/**
 * A compact microphone button that transcribes speech and appends the result
 * to the target field via `onChange`.
 *
 * - Clicking starts listening; clicking again (or letting speech end) stops it.
 * - Interim results update the field in real-time for immediate visual feedback.
 * - Final result commits the text, advancing the base so the next utterance chains.
 * - Returns `null` when the browser doesn't support the Web Speech API (graceful degradation).
 */
export function VoiceMicButton({ value, onChange, className, lang }: VoiceMicButtonProps) {
	// Snapshot of the field value at the moment recording starts.
	// Interim results replace everything after this base, so typing + voice interleave cleanly.
	const baseRef = useRef('')

	const handleTranscript = useCallback(
		(transcript: string, isFinal: boolean) => {
			const base = baseRef.current
			const sep = base.length > 0 && !base.endsWith(' ') ? ' ' : ''
			const updated = base + sep + transcript
			onChange(updated)
			if (isFinal) {
				// Advance base so the next speech segment appends natively
				baseRef.current = updated
			}
		},
		[onChange],
	)

	const { isListening, isSupported, start, stop } = useSpeechInput({
		onTranscript: handleTranscript,
		lang,
	})

	// Don't render anything if browser has no speech support (e.g. Firefox without flags)
	if (!isSupported) return null

	const toggle = () => {
		if (isListening) {
			stop()
		} else {
			baseRef.current = value
			start()
		}
	}

	return (
		<button
			type='button'
			onClick={toggle}
			aria-label={isListening ? 'Stop voice input' : 'Voice input'}
			title={isListening ? 'Stop recording' : 'Dictate text'}
			className={cn(
				'flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150 shrink-0',
				isListening
					? 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 ring-2 ring-red-300/70 dark:ring-red-700/60 animate-pulse'
					: 'text-gray-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
				className,
			)}
		>
			{isListening ? <Square className='w-3 h-3 fill-current' /> : <Mic className='w-3.5 h-3.5' />}
		</button>
	)
}
