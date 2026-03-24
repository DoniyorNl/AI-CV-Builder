'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// ─── Web Speech API type declarations ────────────────────────────────────────
// These are part of the living standard but not yet in all TS lib.dom builds.

type SpeechRecognitionErrorCode =
	| 'aborted'
	| 'audio-capture'
	| 'bad-grammar'
	| 'language-not-supported'
	| 'network'
	| 'no-speech'
	| 'not-allowed'
	| 'service-not-allowed'

interface SpeechRecognitionAlternative {
	readonly transcript: string
	readonly confidence: number
}

interface SpeechRecognitionResult {
	readonly isFinal: boolean
	readonly length: number
	item(index: number): SpeechRecognitionAlternative
	[index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionResultList {
	readonly length: number
	item(index: number): SpeechRecognitionResult
	[index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEvent extends Event {
	readonly resultIndex: number
	readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
	readonly error: SpeechRecognitionErrorCode
	readonly message: string
}

interface ISpeechRecognition extends EventTarget {
	continuous: boolean
	interimResults: boolean
	lang: string
	maxAlternatives: number
	onresult: ((event: SpeechRecognitionEvent) => void) | null
	onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
	onend: (() => void) | null
	start(): void
	stop(): void
	abort(): void
}

interface ISpeechRecognitionConstructor {
	new (): ISpeechRecognition
}

declare global {
	interface Window {
		SpeechRecognition: ISpeechRecognitionConstructor
		webkitSpeechRecognition: ISpeechRecognitionConstructor
	}
}
// ─────────────────────────────────────────────────────────────────────────────

export type SpeechState = 'idle' | 'listening' | 'error'

interface UseSpeechInputOptions {
	/**
	 * Called on every recognition result.
	 * `isFinal = true` means the browser has committed to the transcript.
	 * `isFinal = false` means it's an interim (real-time) result.
	 */
	onTranscript: (text: string, isFinal: boolean) => void
	/** BCP-47 language tag. Falls back to `navigator.language`, then 'en-US'. */
	lang?: string
}

interface UseSpeechInputReturn {
	state: SpeechState
	isSupported: boolean
	isListening: boolean
	start: () => void
	stop: () => void
}

export function useSpeechInput({
	onTranscript,
	lang,
}: UseSpeechInputOptions): UseSpeechInputReturn {
	const [state, setState] = useState<SpeechState>('idle')
	const [isSupported, setIsSupported] = useState(false)
	const recognitionRef = useRef<ISpeechRecognition | null>(null)

	// Stable ref so event handlers never capture a stale callback
	const onTranscriptRef = useRef(onTranscript)
	useEffect(() => {
		onTranscriptRef.current = onTranscript
	})

	// Detect support once on mount (SSR-safe)
	useEffect(() => {
		const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition
		setIsSupported(typeof SR === 'function')
	}, [])

	const start = useCallback(() => {
		const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition
		if (typeof SR !== 'function') return

		// Clean up any previous session
		recognitionRef.current?.abort()

		const recognition = new SR()
		recognition.continuous = false // one utterance per press
		recognition.interimResults = true // real-time feedback
		recognition.lang = lang ?? navigator.language ?? 'en-US'
		recognition.maxAlternatives = 1

		recognition.onresult = (event: SpeechRecognitionEvent) => {
			let interim = ''
			let final = ''
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const txt = event.results[i][0].transcript
				if (event.results[i].isFinal) final += txt
				else interim += txt
			}
			if (final) onTranscriptRef.current(final, true)
			else if (interim) onTranscriptRef.current(interim, false)
		}

		recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
			// 'aborted' fires when we call stop() — not a real error
			if (event.error !== 'aborted') setState('error')
			setState('idle')
		}

		recognition.onend = () => setState('idle')

		recognitionRef.current = recognition
		recognition.start()
		setState('listening')
	}, [lang])

	const stop = useCallback(() => {
		recognitionRef.current?.stop()
		recognitionRef.current = null
		setState('idle')
	}, [])

	// Abort on unmount to avoid memory leaks / dangling handlers
	useEffect(() => {
		return () => {
			recognitionRef.current?.abort()
		}
	}, [])

	return {
		state,
		isSupported,
		isListening: state === 'listening',
		start,
		stop,
	}
}
