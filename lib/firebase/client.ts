import { type FirebaseApp, getApps, initializeApp } from 'firebase/app'
import { type Auth, getAuth } from 'firebase/auth'
import { type Firestore, getFirestore } from 'firebase/firestore'

function getFirebaseConfig() {
	const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
	const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
	const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
	if (!apiKey?.trim() || !authDomain?.trim() || !projectId?.trim()) {
		throw new Error(
			'Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, and NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env.local (or Vercel → Settings → Environment Variables).',
		)
	}
	return {
		apiKey,
		authDomain,
		projectId,
		storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
		messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
		appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
	}
}

// Lazy singletons — only created when first accessed (prevents server-side
// initialization during Next.js prerendering when env vars are absent).
let _app: FirebaseApp | undefined
let _auth: Auth | undefined
let _db: Firestore | undefined

function getFirebaseApp(): FirebaseApp {
	if (_app) return _app
	_app = getApps().length ? getApps()[0] : initializeApp(getFirebaseConfig())
	return _app
}

export function getClientAuth(): Auth {
	if (!_auth) _auth = getAuth(getFirebaseApp())
	return _auth
}

export function getClientDB(): Firestore {
	if (!_db) _db = getFirestore(getFirebaseApp())
	return _db
}

// Eagerly initialise in the browser; during SSR / build the exports are null
// (which is fine — client hooks only use them inside event handlers or
// React-Query functions that run exclusively in the browser).
export const auth: Auth = (typeof window !== 'undefined' ? getClientAuth() : null) as Auth
export const db: Firestore = (typeof window !== 'undefined' ? getClientDB() : null) as Firestore
