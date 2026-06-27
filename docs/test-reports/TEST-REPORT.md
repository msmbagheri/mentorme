# MentorMe — Test Report

**Date:** 2026-06-21 · **Build:** production (`next build`) · **App URL:** http://localhost:3100 · **DB:** PostgreSQL 16 @ localhost:5544

## 1. Summary

| Gate | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | ✅ **0 errors** |
| ESLint (`next lint`) | ✅ **No warnings or errors** |
| Production build (`next build`) | ✅ **Compiled successfully** (24 pages) |
| DB migrate + seed (`prisma migrate deploy` + `db seed`) | ✅ clean, full dataset |
| **E2E (Playwright + Chromium)** | ✅ **42 / 42 passed** (0 failed, ~15.5s) |
| Manual API/smoke checks | ✅ all pass |
| Code hygiene (TODO/mock/placeholder) | ✅ **0 violations** |

**Verdict: SHIP.**

## 2. Tooling

- **Playwright `1.61.0`** driving real **Chromium** (`chromium-1228`), headless — UI E2E + API checks (`request` API) + console/pageerror capture.
- **TypeScript `5.7`** strict typecheck · **ESLint 9** (`eslint-config-next`).
- **curl** — manual API / header smoke tests.
- Config: `playwright.config.ts` (baseURL `:3100`, reuses running server). Run: `npm run test:e2e`.

## 3. Automated E2E results (42 tests, 8 specs)

All passed. Breakdown by spec:

### `public-site.spec.ts` (6) ✅
- `/` redirects to `/en`
- homepage renders DB-driven content in trust-flow order
- all homepage images resolve (no broken images)
- header navigation and primary CTA present
- footer renders with contact info
- skip-to-content link exists (a11y)

### `i18n-rtl.spec.ts` (4) ✅
- English page is LTR (`<html dir="ltr" lang="en">`)
- Persian page is RTL (`<html dir="rtl" lang="fa">`)
- Persian homepage renders Persian content (not EN fallback)
- locale switcher toggles EN ⇄ FA (and flips direction)

### `detail-pages.spec.ts` (8) ✅
- renders service / case-study / team / event / contact detail pages
- unknown slug returns 404
- detail pages emit JSON-LD structured data
- Persian detail page renders RTL

### `lead-form.spec.ts` (3) ✅
- contact form submits → 201 + success UI (real Lead record created)
- invalid email rejected by API (422 envelope)
- lead endpoint rate-limits at **3 per IP per hour** (4th → 429)

### `seo.spec.ts` (5) ✅
- homepage has title, description, canonical + hreflang alternates
- homepage emits Organization + FAQPage JSON-LD
- robots.txt disallows /admin
- sitemap.xml lists localized URLs (en + fa + detail pages)
- OpenGraph tags present

### `admin-auth.spec.ts` (7) ✅
- unauthenticated /admin redirects to login
- wrong credentials show error (no session)
- admin can log in and reach dashboard
- admin can sign out
- each seeded role (admin / editor / viewer) can log in

### `admin-rbac.spec.ts` (4) ✅
- admin sees Users in nav
- editor: no Users nav + Users API → 403
- viewer: no Users nav + read-only (leads read → 200)
- editor can read leads

### `admin-flows.spec.ts` (5) ✅
- dashboard renders widgets
- all 13 admin module pages load (200)
- admin updates a lead status (audited)
- lead CSV + Excel export work
- theme update persists via API

> Reproduce: `npm run test:e2e` · visual report: `npx playwright show-report`

## 4. Manual smoke / checklist evidence (live)

| Check | Evidence |
|---|---|
| `/` → `/en` | HTTP **307** |
| Admin login (NextAuth credentials) | session `"role":"ADMIN"` |
| Admin API (authed) | `GET /api/admin/leads` → **200** |
| Admin API (unauth) | `GET /api/admin/users` → **401** |
| RBAC | editor/viewer → `/api/admin/users` → **403** |
| Lead CSV export | **200** `text/csv; charset=utf-8` |
| Lead Excel export | **200** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| Security headers on `/en` | Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Strict-Transport-Security — **all present** |
| Code hygiene | **0** TODO/FIXME/mock/placeholder violations in `src/` + `prisma/` |
| Seed dataset | 3 users · 7 services · 7 case studies · 9 team · 5 events · 10 leads · 12 homepage sections · 8 grades · 5 CTAs · 2 menus |

## 5. Defects found & fixed during testing

1. **LocaleSwitcher didn't flip `<html dir>`** on soft navigation (stayed LTR until reload). → Fixed: full navigation so the root layout re-renders direction. Verified by `i18n-rtl` test.
2. **Lint tooling broken** (`next lint` had no ESLint config → interactive prompt). → Fixed: added ESLint 9 + `eslint-config-next` + `.eslintrc.json`.
3. **Broken images** (seed referenced `/uploads/*` files that didn't exist). → Fixed: generated 47 on-brand placeholder images at exact paths (`_build/gen-placeholders.mjs`). Verified by `public-site` image test.
4. **Media upload had no type/size limits.** → Fixed: mime allowlist + 25 MB cap (`.exe` → 415, `.png` → 201).
5. **"Client-side exception" after admin login** (user-reported). → Diagnosed as stale-chunk after rebuilds (app healthy: 17/17 admin pages clean in fresh browser). → Fixed: `ChunkErrorReloader` + error-boundary auto-reload (loop-guarded) so a stale chunk self-heals.

## 6. How to re-run
```bash
cd <repo>
npx next start -p 3100      # serve the production build (restart resets rate-limit budget)
npm run test:e2e            # 42 Playwright tests
npm run typecheck && npm run lint && npm run build
```
