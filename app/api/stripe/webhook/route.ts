import { adminDB } from '@/lib/firebase/admin'
import { getStripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

// Next.js App Router: disable body parsing so Stripe can verify the raw body
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
	const body = await req.text()
	const signature = req.headers.get('stripe-signature')

	if (!signature) {
		return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
	}

	// ── Verify Stripe signature ──────────────────────────────────
	let event: Stripe.Event
	try {
		event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
	} catch (err) {
		console.error('[stripe/webhook] Signature verification failed:', err)
		return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
	}

	// ── Handle events ──────────────────────────────────────────
	try {
		switch (event.type) {
			case 'checkout.session.completed': {
				const session = event.data.object as Stripe.Checkout.Session
				const userId = session.metadata?.firebase_uid
				if (userId) {
					await adminDB().collection('users').doc(userId).update({ is_pro: true })
				}
				break
			}

			case 'customer.subscription.deleted': {
				const subscription = event.data.object as Stripe.Subscription
				const customerId = subscription.customer as string
				const snap = await adminDB()
					.collection('users')
					.where('stripe_customer_id', '==', customerId)
					.limit(1)
					.get()
				if (!snap.empty) {
					await snap.docs[0].ref.update({ is_pro: false })
				}
				break
			}

			case 'invoice.payment_failed': {
				const invoice = event.data.object as Stripe.Invoice
				const customerId = invoice.customer as string
				const snap = await adminDB()
					.collection('users')
					.where('stripe_customer_id', '==', customerId)
					.limit(1)
					.get()
				if (!snap.empty) {
					await snap.docs[0].ref.update({ is_pro: false })
				}
				break
			}

			default:
				break
		}
	} catch (err) {
		console.error('[stripe/webhook] DB update error:', err)
		return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
	}

	return NextResponse.json({ received: true })
}
