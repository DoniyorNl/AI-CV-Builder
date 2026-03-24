# 🧠 AI CV Builder

> **AI yordamida professional CV yaratish platformasi** — foydalanuvchi ma'lumot kiritadi, GPT-4o matn yozadi, PDF yuklab olinadi yoki premium obuna orqali watermarksiz eksport qilinadi.

## 📌 Loyiha Haqida

AI CV Builder — to'liq stack **SaaS** web ilovasi. Foydalanuvchilar sun'iy intellekt yordamida professional CV yaratadilar. Bepul foydalanuvchilar watermark bilan PDF oladi; Pro obuna egalari toza PDF, va barcha imkoniyatlardan foydalanadi.

### Asosiy Xususiyatlar

- 🤖 **GPT-4o AI** — summary va tajriba bullet-pointlarini avtomatik yozadi
- 🎙️ **Voice Input** — mikrofon orqali barcha maydonlarga matn kiritish
- 📄 **PDF Export** — react-pdf bilan server-side PDF generatsiya
- 💳 **Stripe To'lov** — oylik obuna (Free / Pro)
- 🔥 **Firebase Auth** — Email, Google, GitHub OAuth
- 🌙 **Dark Mode** — to'liq dark/light tema qo'llab-quvvatlash
- ⚡ **Auto-Save** — 1 soniyalik debounce bilan Firestore'ga avtosave
- 👁️ **Live Preview** — CV yozayotganda real-time 3-panel preview

---

## 🏗️ Arxitektura — Backend Bormi?

**Ha, to'liq backend mavjud.** Next.js App Router orqali server-side API Routes ishlatiladi:

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT (Browser)                    │
│  React 19 · Tailwind CSS · Firebase Client SDK       │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP / REST
┌─────────────────────▼───────────────────────────────┐
│            BACKEND (Next.js API Routes)              │
│                                                      │
│  POST /api/cv/generate     ← OpenAI GPT-4o           │
│  GET  /api/cv/export       ← PDF generatsiya         │
│  POST /api/stripe/checkout ← Stripe session yaratish │
│  POST /api/stripe/webhook  ← Stripe event handler    │
│  POST /api/auth/session    ← Firebase cookie         │
└──────────┬──────────────────────┬───────────────────┘
           │                      │
┌──────────▼──────┐    ┌──────────▼──────────────────┐
│  Firebase Admin │    │       External APIs           │
│  (Firestore DB) │    │  OpenAI API · Stripe API      │
└─────────────────┘    └─────────────────────────────┘
```

### Backend Endpointlari

| Endpoint               | Method | Vazifa                                        |
| ---------------------- | ------ | --------------------------------------------- |
| `/api/cv/generate`     | POST   | GPT-4o orqali CV matni generatsiya            |
| `/api/cv/export`       | GET    | PDF yaratib qaytaradi (plan tekshiruvi bilan) |
| `/api/stripe/checkout` | POST   | Stripe to'lov sessiyasi ochadi                |
| `/api/stripe/webhook`  | POST   | To'lov muvaffaqiyatida `is_pro` yangilaydi    |
| `/api/auth/session`    | POST   | Firebase session cookie boshqaruvi            |
| `/auth/callback`       | GET    | OAuth callback handler                        |
| `/auth/signout`        | GET    | Session o'chirish                             |

---

## 🛠️ Tech Stack

### Frontend

| Texnologiya              | Versiya  | Ishlatilish                            |
| ------------------------ | -------- | -------------------------------------- |
| **Next.js**              | 16.1.6   | Full-stack framework (App Router, RSC) |
| **React**                | 19.2.3   | UI library                             |
| **TypeScript**           | ^5       | Strict mode                            |
| **Tailwind CSS**         | ^4       | Utility-first styling                  |
| **Zustand**              | ^5.0.3   | Client-side state management           |
| **TanStack React Query** | ^5.74.4  | Server state va caching                |
| **React Hook Form**      | ^7.55.0  | Form boshqaruvi                        |
| **Zod**                  | ^3.24.2  | Schema validation                      |
| **Lucide React**         | ^0.511.0 | Icon library                           |
| **Sonner**               | ^2.0.3   | Toast notifications                    |

### Backend / Server

| Texnologiya             | Versiya | Ishlatilish                    |
| ----------------------- | ------- | ------------------------------ |
| **Next.js API Routes**  | 16.1.6  | REST backend (Node.js runtime) |
| **Firebase Admin SDK**  | ^13.7.0 | Server-side Firestore + Auth   |
| **OpenAI SDK**          | ^4.93.0 | GPT-4o API integratsiya        |
| **Stripe**              | ^17.7.0 | To'lov va webhook boshqaruvi   |
| **@react-pdf/renderer** | ^4.3.0  | Server-side PDF generatsiya    |

### Infratuzilma va Servislar

| Servis             | Ishlatilish                                       |
| ------------------ | ------------------------------------------------- |
| **Firebase Auth**  | Email + Google + GitHub OAuth                     |
| **Firestore**      | NoSQL database (users, cvs, cv_sections, exports) |
| **Stripe**         | Oylik obuna, webhook                              |
| **OpenAI GPT-4o**  | AI matn generatsiyasi                             |
| **Vercel**         | Deployment va hosting                             |
| **Web Speech API** | Browser-native ovozli kiritish                    |

---

## 📁 Loyiha Strukturasi

```
ai-cv-builder/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx            # Kirish sahifasi
│   │   └── register/page.tsx         # Ro'yxatdan o'tish
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Dashboard layout (TopNav + ThemeToggle)
│   │   ├── dashboard/page.tsx        # Statistika kartalar + CV ro'yxat
│   │   ├── builder/[id]/edit/        # CV yaratish/tahrirlash
│   │   ├── builder/[id]/preview/     # CV preview
│   │   ├── billing/page.tsx          # Free/Pro rejalari
│   │   ├── history/page.tsx          # Eksport tarixi
│   │   └── settings/page.tsx         # Profil sozlamalari
│   ├── api/
│   │   ├── cv/generate/route.ts      # OpenAI endpoint
│   │   ├── cv/export/route.ts        # PDF eksport endpoint
│   │   ├── stripe/checkout/route.ts  # Stripe checkout
│   │   └── stripe/webhook/route.ts   # Stripe webhook
│   ├── auth/
│   │   ├── callback/route.ts         # OAuth callback
│   │   └── signout/route.ts          # Chiqish
│   └── page.tsx                      # Landing page
│
├── components/
│   ├── landing/LandingPage.tsx       # 9-bo'limli landing page
│   ├── builder/
│   │   ├── CVBuilderClient.tsx       # 3-panel builder
│   │   ├── CVPreviewPanel.tsx        # Real-time preview
│   │   ├── TemplateSelector.tsx      # Template tanlash
│   │   └── sections/                 # Form bo'limlari (voice + AI)
│   ├── templates/                    # Classic / Modern / Minimal
│   └── ui/
│       ├── ThemeToggle.tsx           # Dark/Light toggle
│       └── VoiceMicButton.tsx        # Reusable mic button
│
├── hooks/
│   ├── useAutoSave.ts                # Debounced 1s Firestore auto-save
│   ├── useCV.ts                      # CV data fetching/mutation
│   ├── useSpeechInput.ts             # Web Speech API hook
│   └── useSubscription.ts            # Stripe subscription holati
│
├── lib/
│   ├── openai.ts                     # GPT-4o client + prompt builders
│   ├── pdf.ts                        # react-pdf + watermark logika
│   ├── stripe.ts                     # Stripe client
│   ├── theme.tsx                     # ThemeProvider context
│   └── firebase/
│       ├── admin.ts                  # Firebase Admin SDK (server)
│       ├── client.ts                 # Firebase Client SDK (browser)
│       ├── auth-provider.tsx         # Auth context provider
│       └── session.ts                # Server-side session helper
│
└── types/
    ├── cv.types.ts                   # CV ma'lumot tiplari
    └── database.types.ts             # Firestore schema tiplari
```

---

## 🗄️ Ma'lumotlar Bazasi (Firestore)

```
users/{uid}
  ├── full_name: string
  ├── email: string
  ├── is_pro: boolean          ← Stripe webhook yangilaydi
  ├── stripe_customer_id: string
  └── created_at: timestamp

cvs/{cvId}
  ├── user_id: string
  ├── title: string
  ├── template: "modern" | "classic" | "minimal"
  ├── export_count: number
  └── updated_at: timestamp

cv_sections/{sectionId}
  ├── cv_id: string
  ├── section_type: "personal" | "summary" | "experience" | ...
  ├── content: object
  └── order_index: number
```

---

## 💰 Monetizatsiya Modeli

| Funksiya           | Free               | Pro                    |
| ------------------ | ------------------ | ---------------------- |
| CV yaratish        | ✅ Cheksiz         | ✅ Cheksiz             |
| AI generatsiya     | ✅                 | ✅                     |
| Voice input        | ✅                 | ✅                     |
| Barcha templatelar | ✅                 | ✅                     |
| PDF eksport        | ✅ Watermark bilan | ✅ Toza (watermarksiz) |
| Eksport tarixi     | ✅                 | ✅                     |
| Stripe oylik obuna | —                  | ✅                     |

---

## 🤖 AI Imkoniyatlari

### 1. Professional Summary

Foydalanuvchi qo'pol matn kiritadi → GPT-4o 3-4 ta professional jumladan iborat summary yozadi (birinchi shaxssiz, active voice).

### 2. Experience Bullet Points

Ish tavsifini kiritadi → GPT-4o 3-5 ta action verb bilan boshlangan bullet point yozadi (miqdoriy natijalar bilan).

### 3. Voice Input (Web Speech API)

Barcha form maydonlarida mikrofon tugmasi — bosib gapirasiz, matn maydonga qo'shiladi. Firefox'da graceful degradation.

---

## 🔐 Xavfsizlik

- **Auth check** — har bir API route'da server-side session tekshiriladi
- **Ownership validation** — foydalanuvchi faqat o'z CV'lariga kira oladi
- **Stripe signature** — `webhooks.constructEvent()` bilan imzo tekshiriladi
- **Input validation** — Zod schema + allowlist bilan barcha kirishlar sanitizatsiya
- **Open-redirect himoya** — Stripe redirect URL faqat allowlist orqali
- **No secrets in client** — barcha API kalitlari faqat server-side

---

## 🚀 O'rnatish

### 1. Kerakli muhit o'zgaruvchilari (`.env.local`):

```env
# Firebase Admin (server-side)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Firebase Client (browser)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# OpenAI
OPENAI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. O'rnatish:

```bash
git clone https://github.com/username/ai-cv-builder.git
cd ai-cv-builder
npm install
npm run dev
```

### 3. Firebase Setup

Firebase'da Auth (Email/Password, Google, GitHub) va Firestore'ni yoqing. Production'da domeningizni Firebase Console → Authentication → Authorized domains'ga qo'shing.

### 4. Stripe Setup

```
1. "Pro Plan" mahsulot yarating ($9/oy recurring)
2. Webhook endpoint: /api/stripe/webhook
3. Events: checkout.session.completed, customer.subscription.deleted, invoice.payment_failed
```

### 5. Stripe webhook (local test):

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 📊 Portfolio Uchun

### ✅ Loyiha portfolioga qo'shishga tayyor:

| Mezon                                       | Holat |
| ------------------------------------------- | ----- |
| To'liq stack (Frontend + Backend + DB)      | ✅    |
| Real ishlaydigan to'lov tizimi              | ✅    |
| AI integratsiya (GPT-4o)                    | ✅    |
| Production deployment (Vercel)              | ✅    |
| Xavfsizlik (auth, validation, webhook sign) | ✅    |
| TypeScript strict + clean architecture      | ✅    |
| SaaS business model                         | ✅    |
| 0 compile/lint xato                         | ✅    |

### 🎯 Portfolioda ta'kidlash kerak bo'lgan nuqtalar:

- **Problem**: "Qo'lda CV yozish uzoq vaqt oladi va natija professional emas"
- **Solution**: "GPT-4o + real-time preview + voice input bilan 5 daqiqada tayyor CV"
- **Business**: "Free/Pro SaaS — Stripe recurring subscription"
- **Tech depth**: "Server-side PDF generatsiya, OAuth, webhook handling, plan gating"

---

## 🗺️ Kelajak Rejalar

- [ ] CV'ga public sharing link (shareable URL)
- [ ] Drag-and-drop bo'lim tartibi
- [ ] Ko'proq CV templatelar
- [ ] LinkedIn profil import
- [ ] Cover letter AI generatsiya
- [ ] Multi-til qo'llab-quvvatlash (i18n)
- [ ] CV versiya tarixi

---

_Oxirgi yangilanish: Mart 2026_
