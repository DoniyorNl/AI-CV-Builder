import { getStripe, STRIPE_PRICE_ID } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
	// ── Auth ─────────────────────────────────────────────────────
	const supabase = await createClient()
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser()

	if (authError || !user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	// ── Fetch or create Stripe customer ────────────────────────
	const { data: profileData } = await supabase
		.from('profiles')
		.select('stripe_customer_id, full_name')
		.eq('id', user.id)
		.single()

	const profile = profileData as { stripe_customer_id?: string; full_name?: string } | null

	let customerId = profile?.stripe_customer_id

	if (!customerId) {
		const customer = await getStripe().customers.create({
			email: user.email,
			name: profile?.full_name ?? undefined,
			metadata: { supabase_user_id: user.id },
		})
		customerId = customer.id

		// Persist customer ID
		await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
	}

	// ── Create Stripe Checkout Session ─────────────────────────
	const origin =
		req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

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
		metadata: { supabase_user_id: user.id },
	})

	return NextResponse.json({ url: session.url })
}
