# AI CV Builder — Project Progress

> Last updated: June 2025

---

## Overview

A full-stack AI-powered CV builder built with **Next.js 15 App Router**, **TypeScript**, **Tailwind CSS v4**, **Firebase** (Auth + Firestore), **Stripe** payments, and **OpenAI** for AI-assisted content.

---

## Tech Stack

| Layer       | Technology                                                |
| ----------- | --------------------------------------------------------- |
| Framework   | Next.js 15 (App Router, RSC)                              |
| Language    | TypeScript (strict mode)                                  |
| Styling     | Tailwind CSS v4 (class-based dark mode)                   |
| Auth        | Firebase Auth (Email + Google + GitHub OAuth)             |
| Database    | Firestore (admin SDK server-side, client SDK browser)     |
| Payments    | Stripe (Checkout + Webhooks)                              |
| AI          | OpenAI GPT (summary polish, experience bullet generation) |
| PDF Export  | `@react-pdf/renderer` with watermark for Free plan        |
| Voice Input | Web Speech API (browser-native, no API key required)      |
| Hosting     | Vercel                                                    |

---

## Feature Changelog

### Phase 1 — Core Landing Page

- **Landing Page** (`components/landing/LandingPage.tsx`)
  - Hero section with CTA buttons
  - Feature grid (6 features)
  - How It Works (3 steps)
  - Template Previews (Classic, Modern, Minimal)
  - Testimonials (3 cards)
  - Pricing section (Free vs Pro tiers)
  - FAQ accordion (5 questions)
  - Final CTA section
  - AI Demo widget with typewriter effect demonstrating live AI improvement
- **Template Preview Components** (`components/templates/previews/`)
  - `ClassicPreview.tsx`, `ModernPreview.tsx`, `MinimalPreview.tsx`

### Phase 2 — PDF Watermark (Free Plan)

- **PDF Export** (`app/api/cv/export/route.ts`, `lib/pdf.ts`)
  - Free plan: diagonal "FREE PLAN" watermark across every page
  - Pro plan: clean, watermark-free PDF
  - Gated at the API route level (server-side plan check via Firestore)

### Phase 3 — Dashboard Stats Cards

- **Dashboard** (`app/(dashboard)/dashboard/page.tsx`)
  - 4 stat cards: Total CVs, Last Updated, Templates Used, Export Count
  - Real data fetched from Firestore on each page load (server component)
  - Responsive 2×2 grid layout

### Phase 4 — Builder Live Preview

- **CV Builder** (`components/builder/CVBuilderClient.tsx`)
  - 3-column layout: form sections | live preview | template selector
  - Template switcher (Classic / Modern / Minimal)
  - Show/hide preview toggle (CollapseIcon/ExpandIcon)
  - Real-time preview updates as user types
  - Auto-save hook (`hooks/useAutoSave.ts`) saves to Firestore after 1 s debounce

### Phase 5 — Dark Mode (Full App)

- **ThemeProvider** (`lib/theme.tsx`) — React context with `localStorage` persistence
- **ThemeToggle** (`components/ui/ThemeToggle.tsx`) — Sun/Moon icon button in top nav
- **Anti-flash script** (`app/layout.tsx`) — inline script sets `dark` class before paint
- Every page and component fully themed:
  - Landing page (all 9 sections)
  - Dashboard, CVCard, HistoryClient, Settings, Billing
  - Login, Register pages
  - All builder form sections (Personal, Summary, Experience, Education, Projects, Skills)
  - Top navigation bar

### Phase 6 — Voice Input (Wispr Flow-style)

- **`hooks/useSpeechInput.ts`** — Core Web Speech API hook
  - Full TypeScript interface declarations (`ISpeechRecognition`, `SpeechRecognitionEvent`, etc.)
  - SSR-safe feature detection (checks `window` only client-side)
  - Stable ref pattern prevents stale closures in event handlers
  - Handles `webkit` prefix for Safari/Chrome
  - `continuous: false`, `interimResults: true` for real-time feedback
  - Graceful error handling (ignores `aborted` errors from manual stop)
  - Cleanup on unmount via `useEffect` return
- **`components/ui/VoiceMicButton.tsx`** — Reusable mic button
  - Renders `null` when Web Speech API is unsupported (Firefox graceful degradation)
  - Mic icon (idle) → pulsing red + Stop square icon (listening)
  - **Append logic**: snapshots field value at recording start, appends new speech after existing text
  - Supports chaining utterances (advancing `baseRef` on final transcript)
- **Integrated into all CV form sections:**
  - `PersonalSection` — all 6 fields (name, email, phone, city, LinkedIn, website). Removed legacy `react-hook-form` / `zod` in favor of direct controlled state.
  - `SummarySection` — summary textarea
  - `ExperienceSection` — company input, position input, job description textarea
  - `EducationSection` — institution input, degree input, field of study input
  - `ProjectsSection` — project name input, description textarea

---

## Architecture Decisions

### Voice Input Pattern

```tsx
// In form sections — input field with mic button:
<div className='relative'>
  <input
    value={fieldValue}
    onChange={e => update(e.target.value)}
    className='w-full ... pr-9'   {/* pr-9 leaves room for mic button */}
  />
  <VoiceMicButton
    value={fieldValue}
    onChange={v => update(v)}
    className='absolute right-1.5 top-1/2 -translate-y-1/2'
  />
</div>
```

### Dark Mode Implementation

- Tailwind CSS v4 uses `@custom-variant dark (&:where(.dark, .dark *))` — class-based strategy
- `ThemeProvider` wraps the app, reads from `localStorage`, applies `dark` class on `<html>`
- Anti-flash inline script in `<head>` prevents white flash before JS hydrates

### Auto-Save

- `useAutoSave` hook debounces saves by 1000 ms
- Saves to Firestore via server action / direct client write
- No manual save button needed — fully automatic

### PDF Plan Gating

- Server-side: `/api/cv/export` checks Firestore for `is_pro` flag
- Free: watermark injected as absolute-positioned text layer in react-pdf
- Pro: watermark layer omitted

---

## File Map (Key Files)

```
app/
  layout.tsx                     # Root layout, anti-flash script, ThemeProvider
  page.tsx                       # Redirects to /dashboard (auth check)
  (auth)/login/page.tsx          # Login page (dark mode)
  (auth)/register/page.tsx       # Register page (dark mode)
  (dashboard)/layout.tsx         # Shared dashboard layout with TopNav + ThemeToggle
  (dashboard)/dashboard/page.tsx # Stats cards + CV grid
  (dashboard)/billing/page.tsx   # Free/Pro plan cards + Stripe checkout
  (dashboard)/history/page.tsx   # Export history table
  (dashboard)/settings/page.tsx  # Profile, password, notification settings
  (dashboard)/builder/[id]/edit/ # CV builder page
  api/cv/export/route.ts         # PDF export with plan-based watermark
  api/cv/generate/route.ts       # OpenAI AI generation endpoint
  api/stripe/                    # Stripe checkout + webhook routes

components/
  landing/LandingPage.tsx        # Full landing page (9 sections + AI demo)
  builder/CVBuilderClient.tsx    # 3-panel builder with live preview
  builder/sections/
    PersonalSection.tsx          # Controlled state, voice on all 6 fields
    SummarySection.tsx           # Textarea with AI improve + voice
    ExperienceSection.tsx        # Company/position/description with voice + AI bullets
    EducationSection.tsx         # Institution/degree/field with voice
    ProjectsSection.tsx          # Name/description with voice
    SkillsSection.tsx            # Tag-based skill input
  templates/
    ClassicTemplate.tsx          # PDF/preview template
    ModernTemplate.tsx           # PDF/preview template
    MinimalTemplate.tsx          # PDF/preview template
  ui/
    ThemeToggle.tsx              # Sun/Moon dark mode toggle button
    VoiceMicButton.tsx           # Reusable voice mic button (NEW)

hooks/
  useSpeechInput.ts              # Web Speech API hook (NEW)
  useAutoSave.ts                 # Debounced Firestore auto-save
  useCV.ts                       # CV data fetching and mutation
  useSubscription.ts             # Stripe subscription status

lib/
  theme.tsx                      # ThemeProvider + useTheme context
  pdf.ts                         # react-pdf document with watermark logic
  openai.ts                      # OpenAI client + generation helpers
  stripe.ts                      # Stripe client
  firebase/
    admin.ts                     # Firebase Admin SDK (server-side)
    client.ts                    # Firebase client SDK
    auth-provider.tsx            # Firebase Auth context provider
```

---

## Browser Support (Voice Input)

| Browser | SpeechRecognition | Notes                                      |
| ------- | ----------------- | ------------------------------------------ |
| Chrome  | ✅                | Full support                               |
| Edge    | ✅                | Full support                               |
| Safari  | ✅                | Via `webkitSpeechRecognition`              |
| Firefox | ❌                | `VoiceMicButton` renders `null` gracefully |

---

## Status

| Feature                         | Status      |
| ------------------------------- | ----------- |
| Landing Page                    | ✅ Complete |
| Authentication (Email + OAuth)  | ✅ Complete |
| CV CRUD (create, edit, delete)  | ✅ Complete |
| Builder with Live Preview       | ✅ Complete |
| 3 CV Templates                  | ✅ Complete |
| AI Content Generation           | ✅ Complete |
| PDF Export with Plan Gating     | ✅ Complete |
| Stripe Payments                 | ✅ Complete |
| Dark Mode (full app)            | ✅ Complete |
| Voice Input (all form sections) | ✅ Complete |
| Export History                  | ✅ Complete |
| User Settings                   | ✅ Complete |
