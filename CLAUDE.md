# MentorMe — Project Rules

Bilingual (fa/en, RTL-first) Next.js 15 CMS site. Public site + `/admin` panel, Prisma + Postgres, deployed to mentorme.ir via `scripts/deploy.sh`.

## Design rules (BINDING)

`docs/قوانین سنیور یو ای یو ایکس برای کلودی/uiux-rules/` is the project's design operating system. For ANY UI/UX work (new components, sections, admin screens, style changes), follow it — minimum set: `00-agent-operating-contract.md`, `02-design-system-foundations.md`, `05-accessibility-and-inclusive-design.md`, `07-quality-review-and-anti-patterns.md`.

How those rules map to this codebase:

- **Tokens only, never raw values.** All colors/spacing/type/radius/shadows come from `src/app/globals.css` (`:root` runtime tokens + `@theme inline`). The DB theme (ThemeSetting + per-section HomepageSection overrides) rewrites tokens at runtime — components must reference `var(--…)` tokens so admin theming keeps working.
  - Text: `--color-text-{primary,secondary,muted}` — all ≥4.5:1 on `bg/surface/surface-alt`. Don't lighten them.
  - Status text on soft surfaces: use `--color-warning-text` / `--color-error-text` (the base `--color-warning` is for icons/graphics like rating stars only).
  - Functional boundaries (inputs, selects, textareas): `--color-border-strong` (≥3:1). Decorative card edges: `--color-border`.
  - Card backgrounds: `bg-[var(--card-surface,var(--color-surface))]` — never plain `--color-surface` for cards (per-section card color depends on it).
  - Type scale tokens are `calc(base * var(--font-scale, 1))` — never hardcode font sizes that bypass `--font-scale` (the admin's per-section text size). For custom sizes, multiply by `var(--font-scale,1)`.
- **Accessibility (WCAG 2.2 AA):** visible `:focus-visible` (global rule in globals.css — don't remove), touch targets ≥44px (`min-h-11`), `aria-label` on icon-only buttons, `aria-invalid`/`aria-live` on forms (see `LeadForm.tsx` as reference), alt text on informative images, `prefers-reduced-motion` honored globally.
- **States:** interactive components ship default/hover/focus/disabled + loading/error/success where async (buttons already do — keep parity in new ones).
- **Forms:** label above input (`Field`/`BilingualField` in `components/admin/shared.tsx`), errors inline near fields, never placeholder-only labels, preserve input on failure.
- **Copy:** sentence case, specific verbs on CTAs, bilingual `_en`/`_fa` columns everywhere; numerals with `tabular-nums` for metrics/tables.
- **Contrast check before shipping a new color pair** (quick: python — WCAG relative luminance; text ≥4.5, large/UI ≥3).
- Admin-entered theme colors can break contrast at runtime — that's the admin's choice; DEFAULTS in globals.css must stay AA.

## Engineering conventions

- Services layer (`src/services/*`) owns Prisma; routes/pages never import Prisma directly.
- Public content is bilingual; use `pick(entity, "field", locale)`.
- Media: uploads live in `UPLOAD_DIR` (default `public/uploads`), served via `/api/media/file/<name>`; never assume static `public/` serving for runtime uploads.
- After content mutations call the right `revalidatePath` (see `upsertTheme` / `revalidateForPage` precedents).
- `next build` must work with NO database (placeholder `DATABASE_URL` in Docker): anything reading the DB from layout/metadata needs a try/catch fallback (see `getPwaBranding`) or `force-dynamic` (see `sitemap.ts`, `manifest.ts`).
- E2E: Playwright (`e2e/`), local full suite before deploys (`npx playwright test`), targeted specs against prod with `E2E_BASE_URL=https://mentorme.ir`.
- Deploy: `./scripts/deploy.sh` (build local → ship → podman on VPS). The production CDN (WCDN) replaces 4xx bodies with edge error pages — keep error responses body-less or fixed-length.
