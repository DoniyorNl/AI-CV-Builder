import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2025-01-27.acacia',
	typescript: true,
})

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
