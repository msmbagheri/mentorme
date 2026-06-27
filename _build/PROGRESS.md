# MentorMe Build — Master Progress & Resume Context

> **Resume rule:** Read this file first on any new session. It is the single source of truth
> for what's done, what's in flight, and how to continue. Update it after every phase.

## Project
- **Brand:** MentorMe — "Your Future, Mentored" — Trust-Based Lead Generation Platform
- **Stack:** Next.js 15 (App Router) · React 19 · TS strict · Tailwind v4 · shadcn/ui · Prisma · PostgreSQL · NextAuth v5 · Zod
- **Authoritative spec:** `/tmp/docs_txt/FINAL MASTER IMPLEMENTATION PROMPT.txt.txt` (also `docs/*.rtf`)
- **Condensed specs:** `_build/specs/*.md` (produced by analysis team)

## Environment (already set up — verify, don't redo)
- Node 20.18.1 installed at `~/.local/node`, symlinked into `~/.local/bin` (on PATH globally).
- PostgreSQL 16 in Docker: container `mentorme-pg`, host port **5544** (5433 + 3000 are taken by the user's `infra-*` stack — DO NOT TOUCH those containers).
  - `DATABASE_URL="postgresql://mentorme:mentorme@localhost:5544/mentorme?schema=public"`
  - Restart if needed: `docker start mentorme-pg`
- App runs on port **3100** (3000 is taken by infra-frontend-1). Use `next dev -p 3100` / `next start -p 3100`.
- Prisma migration `init` applied; client generated. Schema is valid.
- App root = repo root (`.`). Docs in `docs/`. Build meta in `_build/`.

## Decisions / Out of scope
- **Do NOT dockerize the app** (user decision, 2026-06-21). No Dockerfile / docker-compose for the MentorMe app. (The only Docker use is the local dev PostgreSQL container `mentorme-pg` — that stays.)

## Team (subagent roles orchestrated by main thread = Technical Manager)
analyst · architect · ux-designer · ui-graphic-designer · product-manager · backend-dev · frontend-nextjs-dev · qa-lead

## Phase Status — ALL COMPLETE ✅
- [x] P0 Environment bootstrap (node, postgres, tooling)
- [x] P1 Spec analysis → `_build/specs/` condensed docs
- [x] P2 Scaffold: package.json, configs, tailwind, prisma schema, seed, core libs
- [x] P3 Backend: services, validation, auth, middleware, API routes
- [x] P4 Frontend public: layouts, pages, section renderers, components
- [x] P5 Admin panel: layout, all modules, components
- [x] P6 SEO/sitemap/robots/structured data
- [x] P7 DB migrate + seed + dev/build verification (build exit 0, 24 pages, lint+tsc clean)
- [x] P8 QA sign-off — VERDICT: SHIP. Media mime/size hardening added post-QA & verified.

## Service layer contract (built, consume these)
See `_build/BUILD-CONTRACT.md` + backend manifest. Public services return localized DTOs from `src/types/cms.ts`. `homepage.service.getHomepage(locale)`, `content.service.*`, `lead.service.*`, `theme/menu/cta/seo/media/user/audit.service`. SEO helpers expected at `src/lib/seo.ts` (`buildPageMetadata`, JSON-LD generators) + `<JsonLd>` component.

## Verified working (runtime, port 3100)
Build ✓ (0 TS errors) · seed ✓ (full dataset) · `/`→`/en` 307 · /en /fa 200 (dir ltr/rtl) · all detail pages 200 · /api/* envelopes ✓ · POST /api/leads creates record · rate-limit 3/hr→429 · /admin→login redirect · NextAuth credentials login (admin/editor/viewer) ✓ · session has role · RBAC: viewer/editor blocked from users API (403) · lead PATCH+audit ✓ · CSV+XLSX export ✓ · JSON-LD (Org/WebPage/FAQ) ✓ · sitemap/robots ✓ · 404 ✓.
Server: `npx next start -p 3100` (build first). Seed creds: admin@example.com/Admin12345!, editor@…/Editor12345!, viewer@…/Viewer12345!

## E2E tests (Playwright)
`npm run test:e2e` — 42 tests, all green. Specs in `e2e/` (public-site, i18n-rtl, detail-pages, lead-form, seo, admin-auth, admin-rbac, admin-flows) + `e2e/helpers.ts`. Config `playwright.config.ts` (chromium, reuses server on 3100). Chromium installed in `~/.cache/ms-playwright`. Restart server before a run to reset the in-memory lead rate-limit budget. Bug fixed during E2E: LocaleSwitcher now does a full navigation so `<html dir>` flips RTL/LTR correctly.

## Test documentation
- `docs/test-reports/TEST-REPORT.md` — formal report: 42/42 E2E pass, per-spec breakdown, manual smoke evidence, defect log, re-run steps.
- Playwright HTML report: `npx playwright show-report` (artifacts in `playwright-report/`).

## Resume Notes (latest first)
- 2026-06-21: FIX — user saw "client-side exception" after admin login. Diagnosed as a STALE-CHUNK error (browser tab from an older build; chunk hashes changed across rebuilds). App itself healthy: all 17 admin pages load with 0 client errors in a fresh browser. Added permanent safety net: `src/components/system/ChunkErrorReloader.tsx` (mounted in root layout) + chunk-error auto-reload branch in `src/app/error.tsx` — both detect ChunkLoadError and silently reload once (15s sessionStorage loop-guard). Rebuilt, restarted, 42/42 E2E pass, 17/17 admin pages clean. User needs ONE hard refresh to pick up this build; thereafter it self-heals.
- 2026-06-21: FULL FROM-SCRATCH RE-TEST — clean `npm install` (486 pkgs, exit 0), `prisma generate`, `migrate deploy` (2 migrations, no pending), idempotent `db seed` (full dataset), regenerated 47 placeholder images, clean `npm run build` (rm .next first) exit 0 / 0 tsc / lint clean / 24 pages, **42/42 E2E pass**, smoke green (6 security headers, auth ADMIN, RBAC 401/403, CSV+XLSX exports 200, DB-driven content, 0 forbidden code patterns). NOTE: `prisma migrate reset` is blocked by Prisma's AI-safety guard — used non-destructive `migrate deploy` + idempotent `db seed` instead (equivalent for this dev DB).
- 2026-06-20: COMPLIANCE — moved homepage section-header labels (eyebrow/title/description) to DB. Added `HomepageSection.{eyebrow,title,description}_{en,fa}` (migration `homepage_section_headers`), `SectionHeaderDTO`+`HomepageDTO.sectionHeaders`, `homepage.service.updateSectionHeader`, admin Homepage Builder header editor, seed copy. 7 renderers now `header?.title ?? fallback`. Verified: admin edit → live revalidation on /en, viewer denied 403, build exit 0, all 42 E2E pass. Now zero homepage business copy sourced from hardcode.
- 2026-06-20: E2E suite added (Playwright, 42 tests passing). Fixed LocaleSwitcher RTL bug. tsc+lint clean, rebuild exit 0.
- 2026-06-20: POLISH — generated 45 on-brand placeholder images (`_build/gen-placeholders.mjs`, via sharp) at the exact /uploads paths the DB references; all 38 homepage images now serve 200 (no broken images). Note: `next start` only scans `public/` at startup, so restart after adding assets. Added media upload mime/size hardening (exe→415).
- 2026-06-20: P4/P5/P6/P7/P8 complete. Full build + runtime QA green. QA verdict: SHIP.
- 2026-06-20: P2 + P3 complete (schema migrated, foundation libs, full service layer + validation + all API routes + auth + middleware). tsc 0 errors. Launching Wave 2: seed + public site + admin + SEO in parallel.
- 2026-06-20: P0/P1 complete (env, condensed specs in _build/specs/).
