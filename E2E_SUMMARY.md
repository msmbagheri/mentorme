# MentorMe — E2E Test Summary

> ## ⚠️ BROWSER / ENGINE LIMITATION (read first)
> This suite ran on a **single browser engine: Chromium**, driven through the
> **system-installed Google Chrome** (`channel: "chrome"`). The Playwright browser
> download is **blocked in this environment**, so **WebKit and Firefox could not be
> installed or run**. The **mobile** project is **Pixel 5 emulation on Chromium**, not
> a real mobile WebKit/Safari. Therefore **"100% green" means green on one engine
> (Chromium), not cross-browser.** Cross-browser (Firefox/WebKit) verification remains
> outstanding and would require an environment where `npx playwright install` succeeds.

---

## 1. Result — LOCAL (docker Postgres + production build)

| Metric | Value |
|---|---|
| **Total** | **98** (97 functional + 1 environment-note) |
| **Passed** | **98** |
| **Failed** | **0** |
| **Skipped** | **0** |
| Projects | `chromium` (desktop, 67) + `mobile` (Pixel 5 emulation, 31) |
| Engine | Chromium (system Google Chrome) |
| App | `next start` production build on `http://localhost:3100` |
| DB | PostgreSQL 16 (container `mentorme-pg`, `localhost:5544`), migrated + seeded |
| Report | `playwright-report-local/index.html` |

**Result — PRODUCTION (`https://mentorme.ir`): NOT YET RUN.** Held pending (a) the
fixed code deployed to prod, (b) a dedicated E2E admin account, and (c) your go-ahead —
per the agreed rule "no production write tests until local is 100% green and purge is
proven." Both preconditions are now met locally; see §5.

## 2. Coverage — full lifecycle for every entity

Each admin entity is driven through the **real browser UI** with **three assertion
layers**: (a) UI confirms success, (b) the DB row actually changed, (c) the public site
reflects it after revalidation. Every create path also tests the **invalid-input** case
(field-level Zod errors shown, no crash).

| Area | Entities | Lifecycle | Public reflection |
|---|---|---|---|
| Content (detail pages) | Service, Case Study, Team Member, Event, Page | Create→UI→DB→publish→public→Edit→toggle→Delete + invalid | detail pages (`/services/[slug]`, …); Page has no public route |
| Homepage repeatables | Testimonial, As-Seen-In, Methodology, Value Prop, Success Metric | full lifecycle + invalid | homepage (`/en`); Success Metric not rendered → UI+DB |
| Homepage singletons | Hero (image picker), Brand Philosophy, Founder, Final CTA | edit→UI→DB→public + invalid | homepage |
| Managers | CTA, Menu, User, SEO, Theme, Media | create/edit/delete or upsert + invalid | header CTA/nav, `<head>` meta, `:root` theme, served file |
| Public | Lead capture, Success Stories, SEO/JSON-LD, i18n/RTL | submit→DB→admin status; 3+ cards→case study | — |
| Mobile / RTL / bilingual | `/en` LTR + Inter, `/fa` RTL + Vazirmatn, hamburger nav, no overflow, locale switch | — | Pixel 5 emulation |
| Auth / RBAC | admin / editor / viewer | login, logout, redirects, 403 on Users API | — |

## 3. Root causes found & fixed

The premise of the original brief — "the write layer is broken" — was **stale**. The
response contract, client wrapper, and entity registry already existed and worked
(verified: Create→201, Edit→200, invalid→422 with `details[]`). The **real** defects were
on the public-reflection / rendering side, plus genuinely-missing admin UI:

1. **No revalidation on mutations.** `createContent`/`updateContent`/`deleteContent` and
   the theme/menu/cta/seo services never called `revalidatePath`, so edits never reached
   the ISR public site. → added `revalidateForEntity` + `revalidatePath('/', 'layout')`.
2. **Runtime uploads 404'd.** `next start`/standalone only serve build-time `public/`
   files. → added `GET /api/media/file/[...path]` + repointed storage URLs.
3. **Theme colors never applied publicly.** `ThemeSetting` colors were not injected into
   `:root`. → added the `ThemeStyle` server component (colors + fonts + `@font-face`).
4. **Whole site rendered in Times New Roman.** Tailwind v4 `@theme inline` does not emit
   `--font-*` as runtime custom properties, and next/font vars sat on `<body>`. → moved
   next/font to `<html>`, defined real `:root` font vars, made `body` inherit. Now
   `/en`=Inter, `/fa`=Vazirmatn.
5. **Image-bearing updates 422'd.** The shared `url` Zod validator (`z.string().url()`)
   rejected relative image paths. → now accepts a full URL **or** an uploaded-media path
   (`/uploads/…` or `/api/media/file/…`), restricted to exactly those.
6. **Invalid-input errors were generic.** `ContentEditor` discarded Zod `details[]`. →
   inline field-level error list (`data-testid="form-errors"`).
7. **Missing admin editors (Phase 3.2).** Hero, Brand Philosophy, Founder, Final CTA had
   **no edit UI at all**; As-Seen-In, Methodology, Value Props, Success Metrics had no
   list editors. → added config-driven singleton editors (with image pickers) + four
   repeatable manager pages (image + sort), incl. `pageId` injection on create.
8. **Fonts not CMS-driven (Phase 3.1).** → added `fontFamily*`/`fontUrl*` to `ThemeSetting`
   (+ migration), a Theme-Manager Typography panel (Vazirmatn preset + custom), and the
   `ThemeStyle` injection.
9. **Mobile horizontal overflow.** Hero CTAs overflowed at the 390px `sm` breakpoint. →
   `sm:flex-wrap` + `body { overflow-x: clip }`.

## 4. Spec ambiguities resolved

- **Featured Review vs. Success Stories.** The single full-width featured testimonial is
  **correct per the Wireframe Spec** (not the "only 1 of 4" bug); all testimonials still
  feed the aggregate rating/review count. The **separate** "Success Stories" section is a
  grid of ≥3 case-study cards, each linking to a Case Study detail page — verified, with a
  dedicated responsive test (added a `line-clamp-5` to honour the "≤5 lines" story rule).

## 5. Production readiness & cleanup proof (rule 4)

- **(a) Dedicated account.** `loginAs("admin")` reads `E2E_ADMIN_EMAIL` /
  `E2E_ADMIN_PASSWORD` from env, so the production run uses a dedicated E2E admin account,
  never a real login. (Locally it defaults to the seed admin.)
- **(b) Tagged fixtures.** Every fixture uses a unique per-run tag: slugs `e2e-<type>-<stamp>`,
  emails `e2e.user.*` / `e2e.lead.*`, names/titles `E2E …`, CTA `e2e-cta-*`, media `e2e-media-*`.
- **(c) Purge proven.** `e2e/purge.ts` deletes all tagged rows; `e2e/global-teardown.ts`
  (enabled with `E2E_PURGE=1`) runs it after the suite and **re-scans to assert zero remain**.
  Proven locally: seeded 4 tagged rows → removed 4 → 0 remaining.

**To run against production** (after deploying this branch and creating the E2E admin):
```bash
E2E_BASE_URL=https://mentorme.ir \
E2E_ADMIN_EMAIL=<dedicated> E2E_ADMIN_PASSWORD=<secret> \
E2E_PURGE=1 \
npx playwright test --workers=1
```
`playwright.config.ts` already reads `E2E_BASE_URL` (and skips the local `webServer`
when it is set), so the command above targets prod with no further config changes.
The DB-assertion helper (`e2e/db.ts`) needs `DATABASE_URL` pointed at the prod DB for
the three-layer checks; otherwise those specs must run UI-only.

## 6. How to reproduce locally
```bash
docker run -d --name mentorme-pg -e POSTGRES_USER=mentorme -e POSTGRES_PASSWORD=mentorme \
  -e POSTGRES_DB=mentorme -p 5544:5432 postgres:16-alpine
export $(grep -v '^#' .env | xargs)
npx prisma migrate deploy && npx prisma db seed
npm run build && npx next start -p 3100 &
npx playwright test --workers=1            # 98 tests, 2 projects (Chromium engine only)
npx playwright show-report playwright-report
```
> `--workers=1` is intentional: several tests mutate shared global state (theme, SEO,
> hero, header CTA/menu) and assert public reflection, so they must run serially.
