# AI CV Builder

AI-powered CV builder built with Next.js 15, Supabase, OpenAI GPT-4o, Stripe, and React-PDF.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Database / Auth | Supabase (PostgreSQL + RLS) |
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
# Fill in all values
\`\`\`

### 3. Database Setup
Run `supabase/schema.sql` in your Supabase SQL Editor.

### 4. Stripe Setup
1. Create Product "Pro Plan" with $9/mo recurring price
2. Add webhook endpoint `/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`

### 5. Run
\`\`\`bash
npm run dev
\`\`\`
