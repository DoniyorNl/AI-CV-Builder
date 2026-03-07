import Stripe from 'stripe'

// Lazily instantiated so the build doesn't fail without STRIPE_SECRET_KEY
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
	if (!_stripe) {
		if (!process.env.STRIPE_SECRET_KEY) {
			throw new Error('STRIPE_SECRET_KEY environment variable is not set')
		}
		_stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
			apiVersion: '2025-02-24.acacia',
		})
	}
	return _stripe
}

/** @deprecated Use getStripe() instead */
export const stripe = {
	get instance() {
		return getStripe()
	},
}

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID!

export const PLANS = {
	free: {
		name: 'Free',
		price: 0,
		features: [
			'Unlimited CV creation',
			'AI-powered content generation',
			'3 professional templates',
			'Real-time preview',
		],
		limit: 'No PDF download',
	},
	pro: {
		name: 'Pro',
		price: 9,
		features: [
			'Everything in Free',
			'Unlimited PDF downloads',
			'Priority AI generation',
			'Remove watermark',
			'Email support',
		],
		limit: null,
	},
} as const
