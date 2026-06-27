# MentorMe — *Your Future, Mentored*

A production-ready, bilingual (English / Persian, LTR + RTL) **trust-based lead-generation platform** with a fully database-driven public website and a complete CMS / Admin Panel.

Built with **Next.js 15 (App Router, RSC) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Prisma · PostgreSQL · NextAuth v5 · Zod**.

---

## Features

**Public site** (`/en`, `/fa`)
- Homepage rendered 100% from the database via a **section registry** in the mandatory trust-flow order (Hero → As Seen In → Methodology → Why Choose Us → Brand Philosophy → Services → Success Stories → Founder Message → Team → Events → Final CTA), with CMS-controlled visibility.
- Detail pages: Services, Case Studies, Team profiles, Events (with registration), Contact.
- Dynamic grade selector, centralized CTA resolution, full i18n (localized content, URLs, nav, CTAs, SEO), RTL/LTR with logical CSS.
- SEO: dynamic metadata, Open Graph, Twitter cards, canonical + hreflang, JSON-LD (Organization, WebPage, Service, Article, Event, ProfilePage, FAQPage, AggregateRating), dynamic `sitemap.xml` + `robots.txt`.
- Lead capture with server-side validation and **rate limiting (3 / IP / hour)**.

**Admin panel** (`/admin`, protected)
- NextAuth v5 credentials auth + **RBAC** (Admin / Editor / Viewer), enforced in middleware, API routes, and pages.
- Dashboard, Homepage Builder, Services, Case Studies, Testimonials, Team, Events, Leads (pipeline + CSV/Excel export + activity timeline), Media Library (provider-abstracted storage), Menus, CTA Manager, Theme Manager, SEO, Users, Audit Logs, Pages, Settings (incl. Grade Options).
- **Content versioning + rollback**, publishing workflow (Draft → In Review → Published → Archived), cache revalidation, and full **audit logging**.

**Architecture**
- Strict data flow: `Database → Service Layer → DTO → Zod → RSC → Renderer`. Prisma access only in `src/services/*`.
- Security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS), bcrypt password hashing, structured logging (Pino), Sentry-ready.
- Future-ready for commerce / portals without DB/auth/routing redesign.

---

## Prerequisites
- Node.js ≥ 20
- A PostgreSQL 14+ database

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    then edit .env — at minimum set DATABASE_URL and NEXTAUTH_SECRET

# 3. Generate client, run migrations, seed data
npm run prisma:generate
npm run prisma:migrate      # applies migrations
npm run prisma:seed         # realistic bilingual seed data

# 4. Run
npm run dev                 # http://localhost:3000  (this build was verified on -p 3100)
```

### Environment variables (`.env.example`)
`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_TRUST_HOST`, `PUBLIC_SITE_URL`, `UPLOAD_DIR`, `STORAGE_PROVIDER`, `CALENDLY_URL`, `CALCOM_URL`, `SENTRY_DSN`, `LOG_LEVEL`.

### Seeded accounts (passwords are bcrypt-hashed)
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `Admin12345!` |
| Editor | `editor@example.com` | `Editor12345!` |
| Viewer | `viewer@example.com` | `Viewer12345!` |

Admin sign-in: **`/admin/login`**.

## Scripts
`dev` · `build` · `start` · `lint` · `typecheck` · `prisma:generate` · `prisma:migrate` · `prisma:deploy` · `prisma:seed` · `db:reset`

## Deployment
Deploy to **Vercel**, **AWS**, or **Docker**. Set the production env vars, run `prisma migrate deploy` then `prisma db seed` (first deploy only), and `npm run build && npm start`. The storage layer (`src/lib/storage.ts`) is provider-abstracted — switch `STORAGE_PROVIDER` to add S3 / R2 / Supabase without touching components.

## Project layout
```
src/app/(site)/[locale]   public website (RSC, ISR revalidate=60)
src/app/(admin)/admin     admin panel (RBAC-protected)
src/app/api               public + admin route handlers ({status,data|error} envelope)
src/components/site       Header/Footer/LeadForm/GradeSelector + section renderers (registry)
src/components/admin      admin modules & editors
src/components/ui         shadcn-style primitives (token-driven)
src/services              service layer (only place Prisma is used)
src/lib                   db, auth, permissions, security, rate-limit, storage, seo, i18n, logger, validation
prisma/schema.prisma      full schema  ·  prisma/seed.ts  realistic bilingual seed
```
