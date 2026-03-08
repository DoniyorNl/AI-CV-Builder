# AI CV Builder

AI-powered CV builder built with Next.js 15, Firebase (Auth + Firestore), OpenAI GPT-4o, Stripe, and React-PDF.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Database / Auth | Firebase (Firestore + Auth) |
| AI | OpenAI GPT-4o |
| Payments | Stripe Subscriptions |
| PDF | @react-pdf/renderer |
| State | TanStack Query |
| UI | Tailwind CSS |

## Quick Start

### 1. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Environment Variables
\`\`\`bash
cp .env.local.example .env.local
# Fill in Firebase (NEXT_PUBLIC_*, FIREBASE_ADMIN_*), OpenAI, Stripe
\`\`\`

### 3. Firebase Setup
Create a Firebase project, enable Auth (Email/Password, Google) and Firestore. Add Firestore security rules; the `users` collection is created on first sign-up. Use Firebase Admin SDK credentials for server-side APIs.

### 4. Stripe Setup
1. Create Product "Pro Plan" with $9/mo recurring price
2. Add webhook endpoint `/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`

### 5. Run
\`\`\`bash
npm run dev
\`\`\`
