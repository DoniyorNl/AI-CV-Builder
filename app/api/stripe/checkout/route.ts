import { adminDB } from '@/lib/firebase/admin'
import { getServerUser } from '@/lib/firebase/session'
import { getStripe, STRIPE_PRICE_ID } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
	// ── Auth ─────────────────────────────────────────────────────
	const user = await getServerUser()
	if (!user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	// ── Fetch or create Stripe customer ────────────────────────
	const profileSnap = await adminDB().collection('users').doc(user.uid).get()
	const profileData = profileSnap.data() as
		| { stripe_customer_id?: string; full_name?: string }
		| undefined

	let customerId = profileData?.stripe_customer_id

	if (!customerId) {
		const customer = await getStripe().customers.create({
			email: user.email,
			name: profileData?.full_name ?? undefined,
			metadata: { firebase_uid: user.uid },
		})
		customerId = customer.id
		await adminDB().collection('users').doc(user.uid).update({ stripe_customer_id: customerId })
	}

	// ── Create Stripe Checkout Session ─────────────────────────
	// Validate origin against known app URL to prevent open-redirect via a
	// forged Origin header — fall back to the configured app URL.
	const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
	const allowedOrigins = [appUrl, 'http://localhost:3000'].filter(Boolean)
	const requestOrigin = req.headers.get('origin') ?? ''
	const origin = allowedOrigins.includes(requestOrigin) ? requestOrigin : appUrl

	const session = await getStripe().checkout.sessions.create({
		customer: customerId,
		payment_method_types: ['card'],
		line_items: [
			{
				price: STRIPE_PRICE_ID,
				quantity: 1,
			},
		],
		mode: 'subscription',
		success_url: `${origin}/billing?success=true`,
		cancel_url: `${origin}/billing?canceled=true`,
		metadata: { firebase_uid: user.uid },
	})

	return NextResponse.json({ url: session.url })
}
