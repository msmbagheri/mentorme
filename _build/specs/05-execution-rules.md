# 05 — Execution Rules & Acceptance Spec

Source of truth: **MASTER EXECUTION PROMPT — VERSION 2.0 FINAL** (Priority 1, HIGHEST). This doc wins ALL conflicts. Where it is silent, lower-priority docs (esp. FINAL MASTER IMPLEMENTATION PROMPT, Priority 2) fill in detail — those additive details are noted as `[from FINAL]`.

This file condenses only the rules that are non-obvious, override other docs, or are non-negotiable acceptance gates. Standard Next.js/Prisma defaults are not repeated.

---

## 0. CONFLICT RESOLUTION — AUTHORITATIVE ORDER

The MASTER EXECUTION PROMPT defines this order (this ordering itself overrides the order printed in the FINAL MASTER IMPLEMENTATION PROMPT):

1. MASTER EXECUTION PROMPT  ← wins everything
2. FINAL MASTER IMPLEMENTATION PROMPT
3. MASTER WEBSITE SPECIFICATION
4. CMS + ADMIN PANEL + DATABASE ARCHITECTURE
5. WIREFRAME SPECIFICATION
6. UI DESIGN SYSTEM SPECIFICATION

> ⚠️ CONFLICT: The FINAL MASTER doc lists the order as `... CMS+Admin (3) > MASTER WEBSITE SPEC (4) ...`, swapping positions 3 and 4. The MASTER EXECUTION PROMPT order above is correct and supersedes it: **MASTER WEBSITE SPECIFICATION outranks CMS+Admin+Database Architecture.**

Higher priority always wins. Any missing feature automatically fails acceptance.

---

## 1. MANDATORY TECH STACK (non-negotiable, use exactly)

- Next.js 15+, App Router, React 19, TypeScript **strict mode**
- Tailwind CSS **v4**, Shadcn UI, Lucide React
- Backend: Next.js Route Handlers (+ Server Actions where appropriate `[from FINAL]`), PostgreSQL, Prisma ORM, Zod
- Auth: Auth.js / **NextAuth v5**, Credentials provider, RBAC (roles: Admin, Editor, Viewer)
- Password hashing: **bcrypt or argon2** `[from FINAL]` — plain-text storage prohibited
- Caching: Next.js Cache, ISR, Revalidation; must be **future-Redis-compatible**
- Media: Next.js Image; WebP + AVIF ready
- Observability: Sentry-ready + structured logging (**Pino or Winston** `[from FINAL]`)

---

## 2. PROJECT STRUCTURE — REQUIRED DEVIATIONS `[from FINAL, Priority 2]`

Use the `src/` tree from FINAL MASTER. Non-obvious deviations from a vanilla Next app:

- Route groups: `app/(site)/[locale]/...` and `app/(admin)/admin/...`
- Required root app files: `middleware.ts`, `sitemap.ts`, `robots.ts`, `not-found.tsx`, `error.tsx`
- Dedicated `src/services/*.service.ts` layer (content, homepage, lead, menu, cta, theme, seo, media, user, audit) — **Prisma only allowed here**
- `src/lib/`: `db.ts, auth.ts, permissions.ts, security.ts, rate-limit.ts, seo.ts, i18n.ts, logger.ts, storage.ts, api-response.ts, utils.ts` + `validation/*.schema.ts`
- Section renderers under `components/site/renderers/` incl. `SectionRegistry.tsx`
- `prisma/schema.prisma` + `prisma/seed.ts`
- Admin pages must include `ctas/page.tsx` and `audit-logs/page.tsx` `[from FINAL — additive; MASTER EXECUTION lists Admin areas without these two but does not forbid them]`

> Note: MASTER EXECUTION PROMPT's Admin-area list omits "CTAs" and "Audit Logs" as standalone areas but mandates CTA configuration and audit logging functionally. FINAL's explicit pages satisfy this — no conflict, treat as required.

---

## 3. DATA-FLOW ARCHITECTURE (MANDATORY, exact)

```
Database → Service Layer → DTO Transformation → Zod (DTO) Validation → React Server Component → Section Renderer
```

Hard rules:
- **Prisma access ONLY in the service layer.**
- Public/visual UI components must NOT: access Prisma, query the DB, or bypass the service layer.
- Homepage MUST NOT use client-side fetch for CMS content (RSC + server data loading only).

### Registry pattern (MANDATORY)
Homepage sections render via a registry object, NOT a giant switch:
```ts
const sectionRegistry = {
  hero, as_seen_in, methodology, why_choose_us, brand_philosophy,
  services, success_stories, founder_message, team, events, final_cta
}
```

---

## 4. NO-HARDCODING RULES (acceptance gates)

Nothing below may be hardcoded — all DB/CMS-driven:
- Homepage business copy/text, images, icons
- Navigation / menu items
- CTA behavior & targets (centralized resolution; **duplicate CTA logic prohibited**)
- Grade list (no grade list hardcoded in UI components)
- Logos (As Seen In)
- SEO metadata (no static-only SEO)
- Brand colors, theme tokens, logos (use CSS variables + Tailwind tokens + DB theme settings)

CTA gradient must use **CTA tokens only**; do not misuse the logo gradient `[from FINAL/UI]`.

---

## 5. MANDATORY HOMEPAGE ORDER (trust-flow, immutable)

1 Header · 2 Hero · 3 As Seen In · 4 Methodology · 5 Why Clients Choose Us · 6 Brand Philosophy · 7 Services · 8 Success Stories · 9 Founder Message · 10 Team Members · 11 Events/Webinars · 12 Final CTA · 13 Footer

- Order is mandatory. No section may break the sequence.
- Admin Homepage Builder may **disable** sections but **may not reorder to violate** the trust-flow sequence.

---

## 6. ISR / REVALIDATION

- Homepage: **ISR required, `revalidate = 60`**.
- Publishing/rollback MUST trigger `revalidatePath()` or `revalidateTag()`.

---

## 7. SECURITY (must be implemented, not described)

- Server-side permission checks (RBAC) on every admin action/API.
- Middleware protects `/admin/*`; verifies authenticated session, role permissions, and locale routing.
- **Rate limiting (server-side enforced):**
  - Leads: **3 submissions per IP per hour** (hard requirement, both docs).
  - Also rate-limit: authentication attempts, media uploads, admin APIs where appropriate `[from FINAL]`.
- **Security headers** `[from FINAL]`: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Strict-Transport-Security.
- Robots: disallow `/admin`, `/api/admin`, private + preview routes.

### RBAC matrix
- **Admin:** full access — users, theme, SEO, leads, CMS, system settings.
- **Editor:** content, media, events, team, leads, SEO, menus, CTAs, theme. **Cannot** manage users/roles or modify system-level settings.
- **Viewer:** read-only.

---

## 8. i18n / RTL

- Languages: English + Persian. Routes: `/en`, `/fa`.
- Both **RTL and LTR required** and functional (use `dir="rtl"` / `dir="ltr"`).
- Localized: metadata, URLs, content, navigation, CTA labels, SEO.
- **Primary content uses dedicated bilingual columns** (`title_en/title_fa`, `headline_en/headline_fa`, `description_en/description_fa`, `content_en/content_fa`, `meta_title_en/fa`, `meta_description_en/fa`).
- **JSON blobs PROHIBITED for primary content** (title/content/description/headline). JSON allowed ONLY for: metadata, social links, configuration, audit snapshots, campaign tracking, optional structured settings.

---

## 9. DATA MODEL / DB RULES

- PostgreSQL + Prisma; schema must be complete & executable with no manual edits.
- Every major content model: `id, createdAt, updatedAt, isActive`.
- Enums (exact): `Role, LeadStatus, ContentStatus, Locale, GradeLevel, CtaActionType, EventStatus, AuditAction` `[from FINAL]`.
- Grades (CMS-driven via `GradeOption`): Grade 6–12 + Transfer Student. Admin controls enable/disable, reorder, funnel type/mode, CTA label/target, lead-source mapping. Grade selection influences lead capture, CTA behavior, contact-form prefill, funnel logic.
- CTA actions: Open Lead Form, Open Contact Page, Open Calendly, Open Cal.com, Internal URL, External URL, Download Asset.
- Lead statuses: NEW → CONTACTED → QUALIFIED → CONVERTED → CLOSED.
- Content lifecycle: DRAFT → IN_REVIEW → PUBLISHED → ARCHIVED.

### Publishing MUST (all three)
Create AuditLog entry + create ContentVersion snapshot + trigger cache revalidation (and update public rendering). Rollback MUST restore prior version + create audit entry + revalidate.

### Audit log
Track: Create, Update, Delete, Publish, Archive, Rollback, Login, Permission Change (+ Lead Status Change, User Mgmt actions `[from FINAL]`). Each entry: User, Action, Entity Type, Entity ID, Timestamp (+ Details, IP, User-Agent where available `[from FINAL]`).

---

## 10. STORAGE ABSTRACTION

- All media access through centralized `src/lib/storage.ts` storage service layer.
- V1 may use Local Storage; architecture must stay swappable to AWS S3 / Cloudflare R2 / Supabase Storage **without component changes**.
- **Direct storage-provider dependency inside UI components is PROHIBITED.**

---

## 11. API CONTRACT

- All routes implemented; no mock/placeholder APIs.
- Public: GET `/api/homepage`, `/api/services` (+`/[slug]`), `/api/case-studies` (+`/[slug]`), `/api/team` (+`/[slug]`), `/api/events` (+`/[slug]`); POST `/api/leads`.
- Admin: leads (GET/PATCH), content (POST/PATCH/DELETE), menu (POST/PATCH/DELETE), theme (POST/PATCH), seo, users; media (POST/DELETE).
- Every API: validation + auth + authorization + error handling + logging.
- **Fixed response envelope:**
  - Success: `{ "status": "success", "data": {} }`
  - Error: `{ "status": "error", "error": { "code", "message", "timestamp", "details": [] } }`

---

## 12. SEO / STRUCTURED DATA

- Editable from Admin; no hardcoded SEO.
- Required: meta title/description, OG, Twitter cards, canonical, indexing/robots controls, sitemap, schema.org / JSON-LD.
- `src/app/sitemap.ts` — auto-discover active + localized + all detail pages (services, case studies, team, events), generated dynamically from DB.
- `src/app/robots.ts` — allow public, disallow `/admin`, `/api/admin`, private/preview.
- Structured data generated **dynamically** (static schema values prohibited): Organization, WebPage, AggregateRating, FAQPage (home); Article, Event, ProfilePage (details).

---

## 13. SEED DATA (must run, must be realistic, must be CMS-editable)

Required: Admin/Editor/Viewer users, theme settings, grade options, menu items, hero, As Seen In logos (min 6), methodology steps, testimonials, value props, brand philosophy, **min 6 services**, **min 6 case studies**, founder message, **min 8 team members**, **min 4 events**, final CTA, footer, SEO settings, sample leads (**min 10** `[from FINAL]`).

Default credentials (passwords hashed): `admin@example.com / Admin12345!`, `editor@example.com / Editor12345!`, `viewer@example.com / Viewer12345!`.

---

## 14. FUTURE-READINESS CONSTRAINTS (affect architecture NOW)

V1 is a **Trust-Based Lead Generation Platform** — NOT ecommerce/marketplace/subscription/LMS. V1 does NOT implement payments, checkout, packages, customer/parent/student accounts, subscriptions, invoices, orders.

BUT architecture must support, with **no future major redesign of database, auth, or routing**:
- Commerce: package catalog, checkout, payment processing, invoices, subscription billing, order management, digital product delivery, customer/parent/student dashboards.
- Portals/routes: `/portal`, `/portal/student`, `/portal/parent`, `/customer`, `/student`, `/parent` — must work later without redesigning auth, DB, CMS, theme, or routing.
- "Do not make architectural choices that block future commerce/portal." Major DB/auth/routing redesign later is **prohibited**.

Deployment targets must remain valid without redesign: Vercel, AWS, Docker.

---

## 15. EXPLICIT "DO NOT" RULES

- ❌ No conceptual/architecture-only output, wireframes-only, pseudocode, placeholders, TODO comments, mock/fake functionality (CMS, Admin, APIs, auth).
- ❌ No incomplete Prisma schema, missing API routes/pages/CRUD/auth/seed/env vars/role permissions/validation/a11y/responsive.
- ❌ No JSON blobs for primary content.
- ❌ No hardcoded homepage copy, menu, CTA behavior, grade list, logos, SEO.
- ❌ No Prisma in UI/public components; no bypassing service layer.
- ❌ No giant switch for section rendering (use registry).
- ❌ No removing focus indicators.
- ❌ No client-side fetch for homepage CMS content.
- ❌ No direct storage-provider coupling in components.
- ❌ No reordering homepage sections out of trust-flow.
- ❌ No `TODO` / "implementation omitted" / "similar pattern" / ellipsis-skipped code `[from FINAL]`.

## 16. EXPLICIT "MUST" RULES (a11y/responsive)

- Every button: `aria-label`; every link: meaningful text; every image: alt text; every form field: label association; visible focus states; keyboard nav; reduced-motion support; skip-to-main + **44px min touch targets** `[from FINAL]`; semantic HTML; color-contrast compliance.
- Responsive breakpoints: 1440 desktop / 1280 laptop / 768 tablet / 390 mobile. **Mobile-first.** No horizontal scroll; grids collapse; RTL+LTR safe.

---

## 17. ACCEPTANCE / DEFINITION-OF-DONE CHECKLIST

**Build commands (all must pass, no errors/modification):**
- [ ] `npm install` · `npm run dev` · `npm run build`
- [ ] `npx prisma generate` · `npx prisma migrate dev` · `npx prisma db seed`
- [ ] `package.json` scripts: dev, build, start, lint, prisma:generate, prisma:migrate, prisma:seed `[from FINAL]`
- [ ] `.env.example` present with: `DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, UPLOAD_DIR, PUBLIC_SITE_URL, CALENDLY_URL, CALCOM_URL, SENTRY_DSN, LOG_LEVEL` `[from FINAL]`

**Zero of:** TypeScript / Prisma / build / routing / hydration errors; missing imports; broken links/nav; missing translations; missing pages/APIs/models.

**Functional gates (must work):** Admin login · RBAC · middleware protects `/admin` · lead capture (saves real record) · lead rate-limiting · admin view/update lead status · CSV + Excel export · CMS · theme mgmt · menu mgmt · CTA mgmt · grade mgmt · SEO mgmt · media library · multilingual EN+FA · RTL + LTR · contact form saves lead · services/case-studies/testimonials/team/events CRUD · audit logs · content versioning · rollback · sitemap · robots · structured data · responsive · a11y basics.

**Content integrity:** Homepage 100% DB-driven; no hardcoded homepage business text; no TODO/placeholder/fake/mock; no hardcoded menu/CTA/grade list; complete Prisma schema; seed data present.

**Final self-audit:** Audit against all 6 docs. If any requirement is missing → STOP, fix, re-audit, verify, then deliver. Partial/incomplete/placeholder/conceptual outputs are rejected.

---

## 18. OVERRIDES / CONFLICTS vs FINAL MASTER IMPLEMENTATION PROMPT (Priority 2)

1. **Doc priority order (real conflict):** MASTER EXECUTION PROMPT places MASTER WEBSITE SPECIFICATION above CMS+Admin+Database Architecture; FINAL reverses these two. **MASTER EXECUTION PROMPT wins** → MASTER WEBSITE SPEC outranks CMS+Admin.
2. **No other hard contradictions.** Everything FINAL adds (Server Actions, bcrypt/argon2, Pino/Winston, security headers, 44px targets, `ctas` & `audit-logs` admin pages, min 10 seed leads, the `src/` tree, enums, response envelope) is **additive detail** consistent with MASTER EXECUTION PROMPT and is therefore binding. Where MASTER EXECUTION PROMPT is functionally stricter or explicit (trust-flow order, no-JSON-for-primary-content, lead rate limit, ISR=60, service-layer-only Prisma), those phrasings govern.
