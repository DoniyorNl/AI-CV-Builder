# 🧠 AI CV Builder — To'liq Loyiha Plani

> **Stack:** Next.js 15 · Firebase · OpenAI GPT-4o · Stripe · React-PDF  
> **Maqsad:** Foydalanuvchi ma'lumotlarini kiritadi, AI professional CV yaratib beradi, PDF yuklab oladi yoki premium funksiyalar uchun to'laydi.

---

## 📁 Folder Structure

```
ai-cv-builder/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── builder/page.tsx
│   │   ├── preview/page.tsx
│   │   └── history/page.tsx
│   ├── (public)/
│   │   └── page.tsx                  ← Landing page
│   ├── api/
│   │   ├── generate-cv/route.ts      ← OpenAI endpoint
│   │   ├── stripe/webhook/route.ts
│   │   └── stripe/checkout/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                           ← shadcn/ui
│   ├── builder/
│   │   ├── StepForm.tsx
│   │   ├── PersonalInfoStep.tsx
│   │   ├── ExperienceStep.tsx
│   │   ├── EducationStep.tsx
│   │   ├── SkillsStep.tsx
│   │   └── SummaryStep.tsx
│   ├── cv-templates/
│   │   ├── TemplateModern.tsx
│   │   ├── TemplateClassic.tsx
│   │   └── TemplateMinimal.tsx
│   ├── PDFDocument.tsx               ← React-PDF component
│   ├── Navbar.tsx
│   └── AuthGuard.tsx
├── lib/
│   ├── firebase.ts
│   ├── firestore.ts
│   ├── openai.ts
│   └── stripe.ts
├── hooks/
│   ├── useAuth.ts
│   └── useCVBuilder.ts
├── types/
│   └── cv.types.ts
└── store/
    └── cvStore.ts                    ← Zustand
```

---

## 🖥️ PAGES — Har bir sahifa batafsil

---

### 1. 🏠 Landing Page `/`

**Maqsad:** Foydalanuvchini jalb qilish, sotish, signup'ga yo'llash

#### Sections:

- **Hero Section**
  - Sarlavha: "AI bilan professional CV yarating — 5 daqiqada"
  - Subtitle: "GPT-4o yordamida shaxsiy, samarali CV"
  - [ `🚀 Bepul Boshlash` ] → /register
  - [ `📄 Demo Ko'rish` ] → preview modal ochiladi
  - Hero image: CV mockup animatsiyasi

- **How It Works (3 qadam)**
  - 1️⃣ Ma'lumotlaringizni kiriting
  - 2️⃣ AI sizning CV'ingizni yozadi
  - 3️⃣ PDF yuklab oling yoki ulashing

- **Templates Preview**
  - 3 ta template kartochka: Modern, Classic, Minimal
  - Ustiga hover qilganda preview kengayadi
  - [ `Bu Templateni Tanlash` ] button har birida

- **Pricing Section**
  - Free Plan kartasi
  - Pro Plan kartasi (highlighted)
  - [ `Pro'ga O'tish` ] → Stripe checkout
  - [ `Bepul Boshlash` ]

- **Testimonials** (3 ta fake/real review kartochka)

- **FAQ** (accordion)
  - "AI nima yozadi?", "To'lov xavfsizmi?", "Ma'lumotlarim saqlanadimi?" va h.k.

- **CTA Section (pastda)**
  - "Bugun boshlang — bepul"
  - [ `Ro'yxatdan O'tish` ]

---

### 2. 🔐 Auth Pages

#### `/login`

- Email + Password inputlar
- [ `Kirish` ] button (Firebase email/password)
- [ `GitHub bilan Kirish` ] button (OAuth)
- [ `Google bilan Kirish` ] button (OAuth)
- "Parolingizni unutdingizmi?" link → modal yoki /forgot-password
- "Hisobingiz yo'qmi? Ro'yxatdan o'ting" link

#### `/register`

- Ism, Email, Password, Confirm Password inputlar
- [ `Ro'yxatdan O'tish` ] button
- [ `GitHub bilan` ] + [ `Google bilan` ] OAuth buttonlar
- "Allaqachon hisobingiz bormi? Kiring" link

---

### 3. 📊 Dashboard `/dashboard`

**Maqsad:** Foydalanuvchining barcha CV'lari va umumiy holat

#### Layout:

- Chap: Sidebar (Dashboard, Builder, History, Settings, Logout)
- O'ng: Main content

#### Main Content:

- **Salom banner:** "Salom, [Ism]! 👋"
- **Stats kartochkalar** (row):
  - 📄 Yaratilgan CV'lar soni
  - ⬇️ Jami yuklab olishlar
  - ⭐ Reja: Free / Pro
  - 🕐 Oxirgi faollik

- **CV'larim ro'yxati** (grid, har biri kartochka):
  - CV nomi (masalan: "Frontend Developer CV")
  - Yaratilgan sana
  - Template nomi
  - [ `👁 Ko'rish` ] → preview page
  - [ `✏️ Tahrirlash` ] → builder page (ma'lumotlar yuklanadi)
  - [ `⬇️ PDF Yuklab Olish` ] → PDF generate qilinadi
  - [ `🗑 O'chirish` ] → confirm modal

- **Yangi CV Yaratish** tugmasi (float yoki header):
  - [ `+ Yangi CV Yaratish` ] → /builder

- **Upgrade Banner** (faqat Free foydalanuvchilarga):
  - "Pro'ga o'ting — cheksiz template va AI qayta yozish"
  - [ `Pro'ga O'tish` ]

---

### 4. 🔨 CV Builder `/builder`

**Maqsad:** Multi-step form orqali CV ma'lumotlarini yig'ish

#### Step Indicator (top):

```
[1. Shaxsiy] → [2. Tajriba] → [3. Ta'lim] → [4. Ko'nikmalar] → [5. Xulosa]
```

---

#### Step 1 — Shaxsiy Ma'lumotlar

**Inputlar:**

- To'liq ism \*
- Kasb/Lavozim (masalan: "Frontend Developer") \*
- Email \*
- Telefon
- Shahar, Mamlakat
- LinkedIn URL
- GitHub URL
- Portfolio URL
- Profil rasmi yuklash (optional, drag & drop)

**Buttonlar:**

- [ `Keyingisi →` ]

---

#### Step 2 — Ish Tajribasi

**Har bir entry uchun:**

- Kompaniya nomi \*
- Lavozim \*
- Boshlanish sanasi (month/year picker)
- Tugash sanasi yoki ✅ "Hozir ishlayapman" checkbox
- Shahar / Remote
- Vazifalar tavsifi (textarea, 3-5 bullet)
- [ `🤖 AI bilan Yax­shi­la` ] → GPT-4o ushbu entry'ni professional qiladi

**Buttonlar:**

- [ `+ Tajriba Qo'shish` ] → yangi entry blok
- [ `🗑 O'chirish` ] har bir entry'da
- [ `← Orqaga` ] [ `Keyingisi →` ]

---

#### Step 3 — Ta'lim

**Har bir entry uchun:**

- Universitet/Maktab nomi \*
- Yo'nalish/Mutaxassislik \*
- Daraja (Bachelor, Master, PhD, etc.) dropdown
- Boshlanish – Tugash yillari
- GPA (optional)
- Qo'shimcha (honors, loyihalar, etc.)

**Buttonlar:**

- [ `+ Ta'lim Qo'shish` ]
- [ `🗑 O'chirish` ]
- [ `← Orqaga` ] [ `Keyingisi →` ]

---

#### Step 4 — Ko'nikmalar & Qo'shimcha

**Ko'nikmalar:**

- Tag-based input (yozib Enter bosadi, chip paydo bo'ladi)
- Masalan: React, TypeScript, Node.js, Firebase
- [ `🤖 AI Ko'nikmalar Tavsiya Qilsin` ] → lavozimga qarab tavsiyalar

**Tillar:**

- Til nomi + darajasi (A1–C2 yoki Beginner/Native) dropdown
- [ `+ Til Qo'shish` ]

**Sertifikatlar (optional):**

- Nomi, muassasa, yil
- [ `+ Sertifikat Qo'shish` ]

**Buttonlar:**

- [ `← Orqaga` ] [ `Keyingisi →` ]

---

#### Step 5 — Template & AI Yaratish

**Template tanlash:**

- 3 ta template vizual preview (kartochka)
- Tanlangan template highlighted bo'ladi

**Til tanlash:**

- CV qaysi tilda bo'lsin: Inglizcha / O'zbekcha / Ruscha / Nemischa

**Tone tanlash:**

- Rasmiy / Ijodiy / Texnik

**AI Yaratish tugmasi:**

- [ `🤖 AI bilan CV Yaratish` ] (katta, asosiy CTA)
- Bosilganda: Loading animation + "GPT-4o CV'ingizni yozmoqda..."
- Muvaffaqiyatli bo'lganda → /preview sahifasiga o'tadi

**Buttonlar:**

- [ `← Orqaga` ]
- [ `🤖 AI bilan CV Yaratish` ]

---

### 5. 👁️ CV Preview `/preview`

**Maqsad:** Tayyor CV'ni ko'rish, PDF olish yoki tahrirlash

#### Layout:

- **Chap panel (1/3):** Asboblar paneli
- **O'ng panel (2/3):** CV live preview (React-PDF renderer)

#### Chap Panel — Asboblar:

**CV Amallar:**

- [ `⬇️ PDF Yuklab Olish` ] ← asosiy button
  - Free: watermark bilan
  - Pro: watermark'siz, yuqori sifat
- [ `🔗 Havola Olish` ] → public share link (Pro only)
- [ `📧 Email yuborish` ] → modal (Pro only)
- [ `💾 Saqlash` ] → Firestore'ga saqlash

**AI Qayta Yozish (Pro):**

- [ `🤖 Summary Qayta Yoz` ]
- [ `🤖 Tajribani Yaxshila` ]
- [ `🤖 Ko'nikmalarni Optimallashtir` ]

**Template o'zgartirish:**

- 3 ta template thumbnail (live switch)

**Ranglar:**

- Color picker (primary rang tanlash) — Pro

**Font tanlash:**

- 3-4 font variant dropdown — Pro

**Agar Free foydalanuvchi pro funksiyani bosgan:**

- Upgrade modal: "Bu funksiya Pro talab qiladi"
- [ `Pro'ga O'tish — $9/oy` ]
- [ `Keyinroq` ]

---

### 6. 📜 History `/history`

**Maqsad:** Barcha saqlangan CV versiyalarini ko'rish

#### Content:

- Jadval yoki kartochkalar grid
- Har bir CV uchun:
  - CV nomi
  - Yaratilgan sana/vaqt
  - Template nomi
  - Status: Draft / Completed
  - [ `Ko'rish` ] [ `Tahrirlash` ] [ `O'chirish` ] [ `PDF` ]

- **Search/Filter:**
  - Input: CV nomi bo'yicha qidirish
  - Filter: Sana, Template

---

### 7. ⚙️ Settings `/settings` (optional page)

- Profil ma'lumotlari tahrirlash (ism, email, rasm)
- Parolni o'zgartirish
- Billing (Stripe portal oynasi)
  - [ `Obunani Boshqarish` ] → Stripe Customer Portal
- Hisobni o'chirish
  - [ `Hisobni O'chirish` ] → confirm modal

---

## 🔌 API Routes

### `POST /api/generate-cv`

```ts
// Request body:
{
  personalInfo: {...},
  experience: [...],
  education: [...],
  skills: [...],
  template: "modern" | "classic" | "minimal",
  language: "en" | "uz" | "ru" | "de",
  tone: "formal" | "creative" | "technical"
}

// Response:
{
  summary: string,           // AI yozgan professional xulosa
  enhancedExperience: [...], // AI yaxshilagan tajriba tavsiflar
  suggestedSkills: [...],    // AI tavsiya qilgan ko'nikmalar
  cvData: {...}              // To'liq CV ob'ekt
}
```

### `POST /api/stripe/checkout`

```ts
// Stripe Checkout Session yaratadi
// Response: { url: "https://checkout.stripe.com/..." }
```

### `POST /api/stripe/webhook`

```ts
// Stripe webhook: payment success → Firestore'da isPro = true
```

---

## 🗄️ Firestore Database Schema

### `users` collection

```
users/{userId}
├── uid: string
├── email: string
├── displayName: string
├── photoURL: string
├── isPro: boolean
├── stripeCustomerId: string
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### `cvs` collection

```
cvs/{cvId}
├── userId: string          ← index
├── title: string
├── template: string
├── language: string
├── tone: string
├── personalInfo: {
│   ├── fullName, jobTitle, email, phone
│   ├── city, country, linkedin, github, portfolio
│   └── photoURL
│   }
├── experience: [
│   { company, position, startDate, endDate,
│     isCurrent, location, description: string[] }
│   ]
├── education: [
│   { school, degree, field, startYear,
│     endYear, gpa, description }
│   ]
├── skills: string[]
├── languages: [{ name, level }]
├── certifications: [{ name, issuer, year }]
├── aiGeneratedSummary: string
├── status: "draft" | "completed"
├── shareToken: string | null   ← Pro: public link uchun
├── downloadCount: number
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

---

## 💳 Pricing Plans

| Xususiyat         | Free               | Pro ($9/oy)      |
| ----------------- | ------------------ | ---------------- |
| CV yaratish       | 3 ta               | Cheksiz          |
| AI yozish         | ✅                 | ✅               |
| Template          | 1 ta (Modern)      | Barcha 3 ta      |
| PDF yuklash       | ✅ watermark bilan | ✅ watermark'siz |
| AI qayta yozish   | ❌                 | ✅               |
| Rang/font tanlash | ❌                 | ✅               |
| Havola ulashish   | ❌                 | ✅               |
| Email yuborish    | ❌                 | ✅               |

---

## 🤖 OpenAI Prompt Strategiyasi

### System Prompt:

```
Sen professional CV yozuvchisan. Foydalanuvchi ma'lumotlari asosida
[TONE] va [LANGUAGE] tilida professional, ATS-friendly CV content yoz.
Har bir tajriba uchun action verb bilan boshlanadigan 3-5 bullet point.
JSON formatida qaytar, hech qanday markdown yo'q.
```

### Tokens Optimallashtirish:

- Max 1500 tokens per request
- Faqat kerakli fieldlarni yubor
- Response cache (bir xil ma'lumot uchun qayta so'ramaslik)

---

## 🔒 Auth & Himoya

- Firebase Auth (email/password + GitHub + Google OAuth)
- `AuthGuard` komponenti — himoyalangan sahifalar uchun
- Firestore Security Rules:
  - Foydalanuvchi faqat o'zining CV'larini ko'ra/tahrirlashi mumkin
  - `isPro` faqat server (Admin SDK webhook) orqali o'zgartiriladi
- API routes: Firebase ID Token verification (server-side)
- Stripe webhook: `stripe.webhooks.constructEvent` signature tekshirish

---

## 🎨 UI/UX Dizayn Prinsiplari

- **Dark/Light mode** toggle (next-themes)
- **Responsive:** Mobile-first (builder ham mobile-friendly)
- **Loading states:** Skeleton loader, spinner, "AI yozmoqda..." animatsiya
- **Error handling:** Toast notifications (react-hot-toast)
- **Form validation:** React Hook Form + Zod
- **Animations:** Framer Motion (step transitions, card hover)
- **Color palette:** Asosiy rang — Indigo/Blue gradient

---

## 📦 Barcha Dependency'lar

```json
{
	"dependencies": {
		"next": "15.x",
		"react": "19.x",
		"firebase": "^10.x",
		"firebase-admin": "^12.x",
		"openai": "^4.x",
		"stripe": "^14.x",
		"@stripe/stripe-js": "^3.x",
		"@react-pdf/renderer": "^3.x",
		"react-hook-form": "^7.x",
		"zod": "^3.x",
		"@hookform/resolvers": "^3.x",
		"zustand": "^4.x",
		"framer-motion": "^11.x",
		"react-hot-toast": "^2.x",
		"next-themes": "^0.x",
		"tailwindcss": "^3.x",
		"@shadcn/ui": "latest",
		"lucide-react": "latest",
		"clsx": "^2.x",
		"date-fns": "^3.x"
	}
}
```

---

## 🚀 Bosqichmа-bosqich Rivojlanish Rejasi

### Hafta 1 — Foundation

- [ ] Next.js 15 + Tailwind + shadcn setup
- [ ] Firebase project (Auth + Firestore)
- [ ] Login/Register sahifalari (email + GitHub OAuth)
- [ ] AuthGuard + useAuth hook
- [ ] Dashboard layout (sidebar)

### Hafta 2 — Builder

- [ ] Multi-step form (Step 1–4)
- [ ] React Hook Form + Zod validation
- [ ] Zustand store (CV state)
- [ ] Form progress save (Firestore draft)

### Hafta 3 — AI + PDF

- [ ] OpenAI API integration (`/api/generate-cv`)
- [ ] React-PDF: 3 ta template
- [ ] Preview sahifasi
- [ ] PDF yuklash funksiyasi

### Hafta 4 — Stripe + Polish

- [ ] Stripe Checkout + Webhook
- [ ] Pro/Free funksiyalar ajratish
- [ ] History sahifasi
- [ ] Loading, error states, toast notifications
- [ ] Mobile responsive
- [ ] Vercel deploy

---

## 🌐 Environment Variables

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Server only)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# OpenAI
OPENAI_API_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔧 Muhim Texnik Qarorlar

| Muammo           | Qaror                 | Sabab                               |
| ---------------- | --------------------- | ----------------------------------- |
| State management | Zustand               | Yengil, React-friendly              |
| Form             | React Hook Form + Zod | Performance + type-safe             |
| PDF              | React-PDF             | Browser + Server render             |
| Auth             | Firebase Auth         | Tez integratsiya                    |
| DB               | Firestore             | Real-time, Firebase bilan bir joyda |
| Payment          | Stripe                | Eng ishonchli                       |
| AI               | OpenAI GPT-4o         | Eng yaxshi CV yozish sifati         |
| Deploy           | Vercel                | Next.js uchun ideal                 |

---

_Yozilgan: Mars 2026 · AI CV Builder v1.0 Portfolio Project_

---

## ✅ TODO LIST — Loyiha Kuzatuvi

> **Belgilar:** ✅ Bajarildi · ❌ Bajarilmadi · 🔄 Qisman bajarildi
> **Oxirgi yangilanish:** Mars 2026

---

### 🏗️ 1-BOSQICH — Foundation (Hafta 1)

| #    | Vazifa                                                   | Holat        |
| ---- | -------------------------------------------------------- | ------------ |
| 1.1  | Next.js 15 + Tailwind CSS + shadcn/ui setup              | ✅ Bajarildi |
| 1.2  | Firebase project yaratish (Auth + Firestore)             | ✅ Bajarildi |
| 1.3  | Firebase Admin SDK (server-side)                         | ✅ Bajarildi |
| 1.4  | Firestore Security Rules                                 | ✅ Bajarildi |
| 1.5  | Login sahifasi (`/login`) — email/password + OAuth       | ✅ Bajarildi |
| 1.6  | Register sahifasi (`/register`) — email/password + OAuth | ✅ Bajarildi |
| 1.7  | Auth callback + signout routes                           | ✅ Bajarildi |
| 1.8  | AuthGuard — himoyalangan sahifalar uchun                 | ✅ Bajarildi |
| 1.9  | Dashboard layout — sidebar bilan                         | ✅ Bajarildi |
| 1.10 | Session management (`/api/auth/session`)                 | ✅ Bajarildi |

---

### 🔨 2-BOSQICH — CV Builder (Hafta 2)

| #    | Vazifa                                               | Holat          |
| ---- | ---------------------------------------------------- | -------------- |
| 2.1  | Multi-step form tuzilmasi (step indicator)           | ✅ Bajarildi   |
| 2.2  | Step 1 — Shaxsiy Ma'lumotlar (`PersonalSection`)     | ✅ Bajarildi   |
| 2.3  | Step 2 — Ish Tajribasi (`ExperienceSection`)         | ✅ Bajarildi   |
| 2.4  | Step 3 — Ta'lim (`EducationSection`)                 | ✅ Bajarildi   |
| 2.5  | Step 4 — Ko'nikmalar (`SkillsSection`)               | ✅ Bajarildi   |
| 2.6  | Step 5 — Xulosa (`SummarySection`)                   | ✅ Bajarildi   |
| 2.7  | Projects bo'limi (`ProjectsSection`) _(bonus)_       | ✅ Bajarildi   |
| 2.8  | React Hook Form + Zod validation                     | ✅ Bajarildi   |
| 2.9  | Zustand store — CV global state (`store/cvStore.ts`) | ❌ Bajarilmadi |
| 2.10 | Auto-save — Firestore draft saqlash (`useAutoSave`)  | ✅ Bajarildi   |
| 2.11 | `useCV` hook — CV CRUD operatsiyalari                | ✅ Bajarildi   |
| 2.12 | Yangi CV yaratish sahifasi (`/builder/new`)          | ✅ Bajarildi   |
| 2.13 | CV tahrirlash sahifasi (`/builder/[id]/edit`)        | ✅ Bajarildi   |

---

### 🤖 3-BOSQICH — AI + PDF (Hafta 3)

| #    | Vazifa                                            | Holat          |
| ---- | ------------------------------------------------- | -------------- |
| 3.1  | OpenAI GPT-4o integratsiya (`lib/openai.ts`)      | ✅ Bajarildi   |
| 3.2  | `POST /api/cv/generate` — AI CV yaratish endpoint | ✅ Bajarildi   |
| 3.3  | Modern Template (`ModernTemplate.tsx`)            | ✅ Bajarildi   |
| 3.4  | Classic Template (`ClassicTemplate.tsx`)          | ✅ Bajarildi   |
| 3.5  | Minimal Template (`MinimalTemplate.tsx`)          | ✅ Bajarildi   |
| 3.6  | Template preview kartochkalar (hover preview)     | ✅ Bajarildi   |
| 3.7  | Template tanlash komponenti (`TemplateSelector`)  | ✅ Bajarildi   |
| 3.8  | CV Preview sahifasi (`/builder/[id]/preview`)     | ✅ Bajarildi   |
| 3.9  | CV Preview paneli (`CVPreviewPanel`)              | ✅ Bajarildi   |
| 3.10 | PDF export (`lib/pdf.ts`)                         | ✅ Bajarildi   |
| 3.11 | `GET /api/cv/export` — PDF yuklab olish endpoint  | ✅ Bajarildi   |
| 3.12 | AI Ko'nikmalar tavsiya qilish (builder ichida)    | ❌ Bajarilmadi |
| 3.13 | AI tajribani yaxshilash (har bir entry uchun)     | ❌ Bajarilmadi |

---

### 💳 4-BOSQICH — Stripe + Polish (Hafta 4)

| #    | Vazifa                                         | Holat               |
| ---- | ---------------------------------------------- | ------------------- |
| 4.1  | Stripe integratsiya (`lib/stripe.ts`)          | ✅ Bajarildi        |
| 4.2  | `POST /api/stripe/checkout` — Checkout session | ✅ Bajarildi        |
| 4.3  | `POST /api/stripe/webhook` — Payment webhook   | ✅ Bajarildi        |
| 4.4  | `useSubscription` hook — Pro/Free farqlash     | ✅ Bajarildi        |
| 4.5  | Billing sahifasi (`/billing`)                  | ✅ Bajarildi        |
| 4.6  | Pro foydalanuvchi uchun watermark'siz PDF      | 🔄 Qisman bajarildi |
| 4.7  | Loading states — skeleton, spinner             | ✅ Bajarildi        |
| 4.8  | Error states — error.tsx, global-error.tsx     | ✅ Bajarildi        |
| 4.9  | Toast notifications (sonner)                   | ✅ Bajarildi        |
| 4.10 | Mobile responsive dizayn                       | 🔄 Qisman bajarildi |
| 4.11 | Vercel deploy konfiguratsiyasi (`vercel.json`) | ✅ Bajarildi        |

---

### 📄 SAHIFALAR — To'liq ro'yxat

| #   | Sahifa                        | Marshrut                | Holat        |
| --- | ----------------------------- | ----------------------- | ------------ |
| P1  | Landing Page                  | `/`                     | ✅ Bajarildi |
| P2  | Login                         | `/login`                | ✅ Bajarildi |
| P3  | Register                      | `/register`             | ✅ Bajarildi |
| P4  | Dashboard                     | `/dashboard`            | ✅ Bajarildi |
| P5  | CV Builder (yangi)            | `/builder/new`          | ✅ Bajarildi |
| P6  | CV Builder (tahrirlash)       | `/builder/[id]/edit`    | ✅ Bajarildi |
| P7  | CV Preview                    | `/builder/[id]/preview` | ✅ Bajarildi |
| P8  | Billing                       | `/billing`              | ✅ Bajarildi |
| P9  | History — CV versiyalar       | `/history`              | ✅ Bajarildi |
| P10 | Settings — Profil sozlamalari | `/settings`             | ✅ Bajarildi |

---

### 🔌 API ROUTES — To'liq ro'yxat

| #   | Route                       | Maqsad                  | Holat        |
| --- | --------------------------- | ----------------------- | ------------ |
| A1  | `POST /api/cv/generate`     | OpenAI CV yaratish      | ✅ Bajarildi |
| A2  | `GET /api/cv/export`        | PDF eksport qilish      | ✅ Bajarildi |
| A3  | `POST /api/stripe/checkout` | Stripe checkout session | ✅ Bajarildi |
| A4  | `POST /api/stripe/webhook`  | Payment tasdiqlash      | ✅ Bajarildi |
| A5  | `POST /api/auth/session`    | Session boshqarish      | ✅ Bajarildi |
| A6  | `GET /auth/callback`        | OAuth callback          | ✅ Bajarildi |
| A7  | `POST /auth/signout`        | Chiqish                 | ✅ Bajarildi |

---

### 🎨 UI/UX XUSUSIYATLAR

| #   | Xususiyat                                      | Holat               |
| --- | ---------------------------------------------- | ------------------- |
| U1  | Dark/Light mode toggle (next-themes)           | ❌ Bajarilmadi      |
| U2  | Framer Motion animatsiyalar                    | ❌ Bajarilmadi      |
| U3  | Responsive mobile-first dizayn                 | 🔄 Qisman bajarildi |
| U4  | Form validation UI (xato xabarlar)             | ✅ Bajarildi        |
| U5  | "AI yozmoqda..." loading animatsiyasi          | 🔄 Qisman bajarildi |
| U6  | Upgrade modal (Pro talab qiluvchi funksiyalar) | ❌ Bajarilmadi      |
| U7  | 404 Not Found sahifasi                         | ✅ Bajarildi        |
| U8  | Dashboard navigatsiya (History + Settings)     | ✅ Bajarildi        |

---

### ⭐ PRO FUNKSIYALAR

| #    | Funksiya                                 | Holat               |
| ---- | ---------------------------------------- | ------------------- |
| PR1  | Watermark'siz PDF (Pro)                  | 🔄 Qisman bajarildi |
| PR2  | AI Summary qayta yozish (Pro)            | ❌ Bajarilmadi      |
| PR3  | AI Tajribani yaxshilash (Pro)            | ❌ Bajarilmadi      |
| PR4  | AI Ko'nikmalarni optimallashtirish (Pro) | ❌ Bajarilmadi      |
| PR5  | Rang tanlash — Color picker (Pro)        | ❌ Bajarilmadi      |
| PR6  | Font tanlash (Pro)                       | ❌ Bajarilmadi      |
| PR7  | Public share link — `shareToken` (Pro)   | ❌ Bajarilmadi      |
| PR8  | Email orqali CV yuborish (Pro)           | ❌ Bajarilmadi      |
| PR9  | Cheksiz CV yaratish (Pro)                | 🔄 Qisman bajarildi |
| PR10 | Barcha 3 template (Pro)                  | 🔄 Qisman bajarildi |

---

### 📊 UMUMIY PROGRESS

```
✅ Bajarildi:      36 ta vazifa
🔄 Qisman:          7 ta vazifa
❌ Bajarilmadi:    13 ta vazifa
─────────────────────────────
📌 Jami:           56 ta vazifa

🟢 Asosiy funksional (MVP): ~95% tayyor
⭐ Pro funksiyalar:          ~15% tayyor
```

---

### 🎯 KEYINGI QADAMLAR (Prioritet bo'yicha)

1. ❌ **Dark/Light mode** — `next-themes` o'rnatish va sozlash
2. ❌ **Upgrade modal** — Pro funksiyalarga bosganda chiqadigan modal
3. ❌ **AI Pro funksiyalar** — qayta yozish, ko'nikmalar optimallashtirish
4. ❌ **Public share link** — Pro foydalanuvchilar uchun
5. ❌ **Framer Motion** — animatsiyalar qo'shish
6. ❌ **Mobile responsive** — to'liq sinovdan o'tkazish va tuzatish
7. ❌ **Zustand store** (`store/cvStore.ts`) — global CV state
8. ❌ **Rang/Font tanlash** — CV customization (Pro)
