# MentorMe — BUILD CONTRACT (read before writing any code)

Authoritative project root: `/media/metadeep/DATA1/Metadeep/Projects/MentorMe`.
Stack: Next.js 15.1 (App Router, RSC) · React 19 · TS strict · Tailwind v4 · Prisma · PostgreSQL · NextAuth v5 (JWT) · Zod · lucide-react.

## Specs (read what's relevant to your task)
- `_build/specs/01-data-model.md` — every model/field (matches `prisma/schema.prisma`).
- `_build/specs/02-design-system.md` — colors/tokens/components.
- `_build/specs/03-wireframes.md` — per-section + admin layouts.
- `_build/specs/04-content.md` — copy + seed content.
- `_build/specs/05-execution-rules.md` — hard rules & acceptance gates.

## Foundation already built (DO NOT recreate; import these)
- `src/lib/db.ts` → `prisma` (Prisma client). **Prisma may ONLY be imported in `src/services/*` and `prisma/seed.ts` and `src/lib/auth.ts`. Never in components/pages/API-routes directly — go through services.**
- `src/lib/api-response.ts` → `ok/created/fail/fromZodError/unauthorized/forbidden/notFound/tooManyRequests/serverError`. ALL API routes use this envelope: success `{status:"success",data}`, error `{status:"error",error:{code,message,timestamp,details}}`.
- `src/lib/auth.ts` → `auth()` (session), `signIn`, `signOut`, `handlers`. `src/lib/auth.config.ts` (edge-safe).
- `src/lib/permissions.ts` → `can(role,cap,resource)`, `assertCan`, `PermissionError`, `NAV_RESOURCES`, types `Resource`/`Capability`.
- `src/lib/security.ts` → `hashPassword`, `verifyPassword`, `getClientIp`, `getUserAgent`.
- `src/lib/rate-limit.ts` → `rateLimit(key,limit,windowMs)`, `RATE_LIMITS` (LEAD=3/hr, AUTH, MEDIA_UPLOAD, ADMIN_WRITE).
- `src/lib/storage.ts` → `storage.save/delete`, `detectMediaType`.
- `src/lib/logger.ts` → `log.{auth,lead,publish,permission,error,info}`.
- `src/lib/i18n.ts` → `pick(obj, base, locale)` for `*_en/*_fa`, `t(locale)`, `dictionary`.
- `src/lib/utils.ts` → `cn`, `slugify`, `formatDate`, `formatTime`, `truncate`, `absoluteUrl`.
- `src/lib/validation/auth.schema.ts` (loginSchema, userCreate/UpdateSchema), `lead.schema.ts` (leadCreate/StatusUpdate/Activity).
- `src/types/locale.ts` → `AppLocale` ('en'|'fa'), `LOCALES`, `DEFAULT_LOCALE`, `isLocale`, `dirFor`, `otherLocale`, `toDbLocale`.
- `src/types/api.ts`, `src/types/cms.ts` (**all public DTOs — services return these, components consume these**).
- `src/components/ui/*`: `button` (variants: cta|primary|secondary|outline|ghost|destructive|link|text; sizes sm|md|lg|icon), `input`, `textarea`, `label`, `card` (Card/CardHeader/CardTitle/CardDescription/CardContent/CardFooter), `badge` (variants neutral|brand|success|warning|error|info), `select` (styled native). You MAY add more `ui/*` primitives (dialog, tabs, switch, table, dropdown-menu, toast) following shadcn conventions using installed `@radix-ui/*`. Do NOT modify existing primitives' public API.
- `src/middleware.ts` — locale routing (`/`→`/en`) + `/admin/*` protection + sets `x-locale` header.
- `src/app/layout.tsx` — root html/body, Inter + Vazirmatn fonts (CSS vars `--font-inter`,`--font-vazirmatn`), reads `x-locale`.
- `src/app/globals.css` — Tailwind v4 `@theme` tokens. Use tokens, NEVER hardcode brand colors. CTA gradient = class `bg-gradient-cta`; logo gradient = `bg-gradient-logo`/`text-gradient-logo` (logo/brand only). `.container-page`, `.section-spacing` helpers exist.

## Routing
- Public site: `src/app/(site)/[locale]/...` — `[locale]` is `en`|`fa`. Pages are RSC, `export const revalidate = 60` (ISR) on homepage + detail index pages.
- Admin: `src/app/(admin)/admin/...` — NOT locale-prefixed. Protected by middleware; also re-check session+RBAC server-side in each page/action.
- API: `src/app/api/...` (see structure in spec). Auth route: `src/app/api/auth/[...nextauth]/route.ts` exports `{ GET, POST } = handlers`.

## Hard rules (acceptance gates — violating = fail)
1. No Prisma outside services/seed/auth. Components/pages call services; services return DTOs from `types/cms.ts`.
2. Homepage renders via a **registry object** (`components/site/renderers/SectionRegistry.tsx`), not a switch. Section order is the fixed trust-flow in `SECTION_ORDER` (types/cms.ts) — admin can disable but not reorder.
3. Nothing hardcoded: homepage copy, nav/menu, CTA behavior, grade list, logos, SEO — all DB-driven.
4. Localized primary content uses paired columns; services localize via `pick()`. Both `/en` (LTR) and `/fa` (RTL) must render. Use logical CSS (`ps-`/`pe-`/`ms-`/`me-`/`inset-inline-*`), not left/right.
5. Every API: validate (Zod) → authenticate → authorize (RBAC) → handle errors → log. Use the response envelope.
6. Lead POST: rate-limit 3/IP/hour (`RATE_LIMITS.LEAD`), validate `leadCreateSchema`, persist real Lead + initial LeadActivity.
7. Admin mutations: `assertCan(role, cap, resource)` server-side; create AuditLog; publish/rollback → ContentVersion snapshot + `revalidatePath`/`revalidateTag`.
8. A11y: aria-labels, alt text, label association, visible focus (already global), 44px targets, semantic HTML. Images via `next/image`.
9. NO TODO/placeholder/mock/"similar pattern"/ellipsis-skipped code. Everything real and complete.

## Service layer API (you implement in P3; consumers rely on these names)
`src/services/`:
- `homepage.service.ts` → `getHomepage(locale): Promise<HomepageDTO>` (assembles everything for `home` page), `getSectionVisibility()`.
- `content.service.ts` → services/case-studies/team/events list+detail localized DTOs + related items; raw fetchers for admin; generic versioning helpers (`createVersion`, `listVersions`, `rollback`), `publishEntity`.
- `lead.service.ts` → `createLead`, `listLeads`, `getLead`, `updateLeadStatus`, `addActivity`, `exportLeads`.
- `menu.service.ts`, `cta.service.ts` (`resolveCta(record|id, locale): CtaDTO`), `theme.service.ts` (`getTheme(locale): ThemeDTO`), `seo.service.ts`, `media.service.ts`, `user.service.ts`, `audit.service.ts` (`record(action, …)`).
- Each public getter returns `types/cms.ts` DTOs already localized. Admin getters return raw Prisma records (bilingual) for editing.

## Env / ports (already configured)
- DB on `localhost:5544` (container `mentorme-pg`). App on port **3100**. `node`/`npm`/`npx` on PATH.
- Run: `npm run dev` (= next dev; add `-p 3100`), `npm run build`, `npx prisma db seed`.
