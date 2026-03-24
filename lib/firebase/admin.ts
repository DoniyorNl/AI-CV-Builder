import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function getAdminApp() {
	if (getApps().length > 0) return getApps()[0]

	return initializeApp({
		credential: cert({
			projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
			clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
			privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
		}),
	})
}

/** Firebase Admin Auth — use for session cookie management */
export function adminAuth() {
	return getAuth(getAdminApp())
}

/** Firebase Admin Firestore — use for trusted server-side reads/writes */
export function adminDB() {
	return getFirestore(getAdminApp())
}
