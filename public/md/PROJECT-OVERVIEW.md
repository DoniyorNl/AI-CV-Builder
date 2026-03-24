# AI CV Builder — To'liq Loyiha Sharhi

---

## Loyiha nima?

AI yordamida professional CV yaratish uchun **to'liq stack SaaS** ilovasi. Foydalanuvchi forma to'ldiradi, GPT-4o matn yozadi, PDF yuklab olinadi. Bepul rejada watermark, Pro rejada toza PDF.

---

## Deploy qayerda?

| Qatlam                 | Servis                                |
| ---------------------- | ------------------------------------- |
| **Frontend + Backend** | **Vercel** (Next.js serverless)       |
| **Ma'lumotlar baza**   | **Firebase Firestore** (Google bulut) |
| **Autentifikatsiya**   | **Firebase Auth** (Google bulut)      |
| **To'lov**             | **Stripe** (tashqi)                   |
| **AI**                 | **OpenAI API** (tashqi)               |

> **Firebase faqat DB va Auth uchun** — kod Vercel'da ishlaydi. "Firebase deploy" faqat Firestore rules/indexes uchun ishlatiladi.

---

## Arxitektura

```
Browser (React 19)
    │
    ├── Firebase Client SDK  →  Firestore (real-time reads/writes)
    │
    └── HTTP fetch  →  Next.js API Routes (Vercel serverless)
                            │
                            ├── Firebase Admin SDK  →  Firestore
                            ├── OpenAI API          →  GPT-4o
                            └── Stripe API          →  To'lov
```

**Backend = Next.js API Routes** — alohida server yo'q, Vercel serverless functions.

---

## API Endpointlar (Backend)

| Route                  | Method | Nima qiladi                                 |
| ---------------------- | ------ | ------------------------------------------- |
| `/api/cv/generate`     | POST   | GPT-4o bilan summary/bullets yozadi         |
| `/api/cv/export`       | GET    | PDF generatsiya + plan tekshiruvi           |
| `/api/stripe/checkout` | POST   | Stripe to'lov sessiyasi ochadi              |
| `/api/stripe/webhook`  | POST   | To'lov muvaffaqiyatida `is_pro=true` qiladi |
| `/api/auth/session`    | POST   | Firebase session cookie saqlaydi            |
| `/auth/callback`       | GET    | OAuth redirect handler                      |
| `/auth/signout`        | GET    | Session o'chiradi                           |

---

## Firestore Strukturasi

```
users/{uid}          →  is_pro, stripe_customer_id, full_name
cvs/{cvId}           →  user_id, title, template, export_count
cv_sections/{id}     →  cv_id, user_id, type, content, order_index
```

**Xavfsizlik:** Firestore Rules — foydalanuvchi faqat o'z dokumentlarini o'qiy/yoza oladi. Server tomonida Firebase Admin SDK (bypass rules) ishlatiladi.

---

## Tech Stack (qisqacha)

```
Next.js 16 (App Router)   — framework
React 19 + TypeScript     — UI
Tailwind CSS v4           — styling
Zustand                   — client state
TanStack Query            — server state / cache
Firebase Auth + Firestore — auth + database
OpenAI GPT-4o             — AI
Stripe                    — to'lov
@react-pdf/renderer       — PDF generatsiya
Web Speech API            — ovozli kiritish (browser-native)
Vercel                    — hosting / deployment
```

---

## Funksionallik

- **Auth:** Email, Google, GitHub OAuth → session cookie
- **Builder:** 6 bo'lim forma (Personal, Summary, Experience, Education, Skills, Projects)
- **AI:** Summary yaxshilash + Experience bullet-points (GPT-4o)
- **Voice Input:** Barcha maydonlarda mikrofon (Web Speech API)
- **Live Preview:** 3-panel layout — forma | real-time preview | template
- **Auto-Save:** 1s debounce bilan Firestore'ga avtomatik
- **Prev/Next nav:** Bo'limlar o'rtasida navigatsiya tugmalari
- **3 Template:** Modern, Classic, Minimal
- **PDF Export:** Free = watermark, Pro = toza
- **Stripe:** Oylik obuna, webhook orqali `is_pro` flag
- **Dark Mode:** Butun ilova, localStorage'da saqlanadi
- **Dashboard:** CV ro'yxat + statistika kartalar
- **History:** Eksport tarixi
- **Settings:** Profil, parol

---

## Xavfsizlik (OWASP)

- Har bir API route'da server-side auth tekshiruvi
- Foydalanuvchi faqat o'z CV'lariga kira oladi (ownership check)
- Stripe webhook imzosi `constructEvent()` bilan tekshiriladi
- Barcha input Zod schema + allowlist bilan sanitizatsiya
- API kalitlari faqat server-side (`.env` → Vercel secrets)
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` headerlari
- Stripe redirect URL open-redirect himoyasi bilan

---

## "Frontend faqatmi?" savoliga javob

**Yo'q.** Bu loyihada:

- ✅ **Server-side backend** bor (Next.js API Routes)
- ✅ **Database** bor (Firestore)
- ✅ **Auth** bor (Firebase Auth + session cookie)
- ✅ **To'lov tizimi** bor (Stripe)
- ✅ **AI integratsiya** bor (OpenAI)
- ✅ **PDF generatsiya** bor (server-side)

Bu **to'liq SaaS mahsulot**, frontend-only emas.

---

_Mart 2026_
