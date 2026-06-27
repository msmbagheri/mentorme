# MentorMe — Design System Spec (02)

> Condensed, implementation-ready. Source: `UI DESIGN SYSTEM SPECIFICATION v2.0 FINAL`.
> Brand: **MentorMe** — *Your Future, Mentored*. Feel: human, professional, premium, educational, approachable, reliable, modern.
> All values token-driven. **Hardcoded component colors/logos are prohibited.** Tokens are DB-overridable via `ThemeSetting`.
> Items marked **(designer default)** are not in the source doc; chosen to be consistent with a premium education/mentorship brand.

---

## 1. Color Palette (exact HEX)

### Text
| Token | HEX |
|---|---|
| `--color-text-primary` | `#09122C` |
| `--color-text-secondary` | `#5B6475` |
| `--color-text-muted` | `#8A94A6` |
| `--color-text-inverse` (designer default) | `#FFFFFF` |

### Surfaces / Neutrals
| Token | HEX |
|---|---|
| `--color-white` | `#FFFFFF` |
| `--color-bg` | `#F8FAFC` |
| `--color-surface` | `#FFFFFF` |
| `--color-surface-alt` (designer default) | `#F1F4F9` |
| `--color-border` | `#E6EAF0` |
| `--color-border-strong` (designer default) | `#CDD4E0` |

### Semantic / Functional
| Token | HEX | Soft bg (designer default) |
|---|---|---|
| `--color-success` | `#16A34A` | `#E8F6EE` |
| `--color-warning` | `#F59E0B` | `#FEF4E2` |
| `--color-error` | `#DC2626` | `#FBE9E9` |
| `--color-info` | `#2563EB` | `#E7EFFD` |

### Accent (brand)
| Token | HEX | Role |
|---|---|---|
| `--color-accent-left-start` | `#FF8255` | warm/orange ramp start |
| `--color-accent-left-end` | `#FFA27E` | warm/orange ramp end |
| `--color-accent-right-start` | `#E4007F` | magenta ramp start → **CTA start** |
| `--color-accent-right-end` | `#FF40A3` | magenta ramp end → **CTA end** |
| `--color-accent-blend` | `#C7156F` | blend / **focus ring color** |

### Brand semantic roles (designer default mapping)
- `--brand-primary` = `#E4007F` (magenta — primary brand color)
- `--brand-secondary` = `#FF8255` (warm accent)
- `--brand-accent` = `#C7156F` (blend)

### Gradients — LOGO vs CTA are DISTINCT
| Token | Definition | Allowed surfaces |
|---|---|---|
| `--gradient-logo` (designer default fill) | `linear-gradient(135deg, #FF8255, #E4007F)` (warm→magenta, full brand sweep) | **Logo / brand assets / marketing / print ONLY.** Never hero/card/CTA/section/decorative background. |
| `--gradient-cta` | `linear-gradient(135deg, #E4007F, #FF40A3)` | Primary CTA buttons, Hero primary CTA, Final CTA. **Never** cards/hero bg/page bg/section bg. |
| `--gradient-soft` (designer default fill) | `linear-gradient(135deg, #FFF1EC, #FBE3F0)` | Subtle background accent only. |

> **Rule:** CTA gradient MUST use CTA tokens (`#E4007F → #FF40A3`) only — never reuse the logo gradient as a CTA/background. Logo gradient is reserved to protect brand recognition + CTA contrast.

---

## 2. Typography

**Families**
- EN: `Inter, "Segoe UI", sans-serif`
- FA/Persian: `Vazirmatn, IRANSansX, sans-serif`

**Weights:** 400 (body), 600 (headings/labels/buttons), 700 (H1).

**Type scale**
| Style | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|
| H1 (Hero) | 56px | 700 | 1.1 | -1% (`-0.01em`) |
| H2 (Section) | 40px | 600 | 1.2 | normal |
| H3 (Card) | 24px | 600 | 1.3 | normal |
| H4 *(designer default)* | 20px | 600 | 1.35 | normal |
| H5 *(designer default)* | 18px | 600 | 1.4 | normal |
| H6 *(designer default)* | 16px | 600 | 1.45 | normal |
| Body Large | 18px | 400 | 1.6 | normal |
| Body | 16px | 400 | 1.6 | normal |
| Small / Caption | 14px | 400 | 1.4 | normal |

**Rules:** min font size **14px**; max reading width **75ch**; readability over decoration. Responsive type (designer default H1 ladder): 56 → 44 (tablet) → 34 (mobile); H2: 40 → 32 → 26.

---

## 3. Spacing, Radii, Shadows, Layout

**Spacing (8px base grid)**
`--space-1:8` · `--space-2:16` · `--space-3:24` · `--space-4:32` · `--space-5:48` · `--space-6:64` · `--space-7:96` · `--space-8:120` (px).

**Section spacing:** Desktop 120 · Tablet 96 · Mobile 72.

**Border radius:** `--radius-sm:8` · `--radius-md:12` · `--radius-lg:16` · `--radius-xl:20` · `--radius-pill:999` (px).

**Shadows / elevation**
- `--shadow-sm: 0 2px 8px rgba(0,0,0,.06)`
- `--shadow-md: 0 6px 20px rgba(0,0,0,.08)`
- `--shadow-lg: 0 12px 40px rgba(0,0,0,.12)`

**Container / grid**
- Max width **1200px**; padding: Desktop/Tablet 24px, Mobile 20px.
- Grid: Desktop 12col / 24px gutter / 1200px · Tablet 8col / 20px gutter · Mobile 4col / 16px gutter.

**Breakpoints:** Mobile `390px` · Tablet `768px` · Laptop `1280px` · Desktop `1440px`. Mobile-first, no horizontal scroll, touch-friendly.

---

## 4. Component Visual Specs

**Buttons** (min height 44px a11y, keyboard accessible, visible focus, aria-label required)
- **Primary / CTA gradient:** height 56px · padding `0 28px` · radius 999px · bg `--gradient-cta` · text white · weight 600. Hover: scale 1.02, slight brightness up, enhanced shadow. **One primary CTA per section (mandatory).**
- **Secondary:** transparent bg · `1px solid var(--color-border)` · text `--color-text-primary` · radius 999px (designer default) · **no gradients**. Hover (designer default): `--color-border-strong`.
- **Text button:** no bg · underline · color `--color-text-primary`. Low-pressure/informational.

**Inputs / Forms** (approachable, low friction, not administrative)
- Input: height 56px · radius 12px · `1px solid var(--color-border)` · padding 16px · label above field · placeholder optional.
- Textarea: min-height 120px · resize vertical only.
- Select: keyboard nav + RTL/LTR.
- Validation: success `--color-success`, warning `--color-warning`, error `--color-error`; clear feedback. Focus border `--color-accent-blend` (designer default).

**Cards** (lightweight, not heavy, no aggressive effects)
- Default: white bg · radius 16px · padding `24px 32px` · `--shadow-sm`. Hover: `translateY(-4px)` + `--shadow-md`.
- Service: image 16:10 · title H3 · body · text CTA · entire card clickable.
- Testimonial: `1px solid var(--color-border)` · padding 32px · quote top, rating bottom.
- Team: image 1:1 · name 18px · role 14px · bio 14–16px · CTA "View Profile".
- Event: image 16:9 · date badge top-left · title 20px · meta 14px · actions Register / View Details.

**Header / Nav:** sticky · transparent on top → solid on scroll · single primary CTA · CMS-controlled nav.
**Mobile menu:** fullscreen overlay · touch-optimized · keyboard accessible · contains nav + primary CTA + contact info + social links.

**Hero:** eyebrow · headline (H1) · subheadline · grade selector · primary CTA · secondary CTA · trust indicator · hero image.
**Grade selector:** grades 6–12 + Transfer, generated from CMS (no hardcoded lists). States: default / hover / selected / disabled. **Selected state must NOT use `--gradient-logo`**; may use brand accent / theme tokens.

**Badges (designer default):** radius `--radius-pill`, padding `2px 12px`, 14px/600, soft semantic bg + matching text (e.g. success `#E8F6EE` / `#16A34A`). Date badge for event cards.

**Section header:** eyebrow + title + description + content (all sections except Hero/Footer); consistent spacing.
**Skeletons:** `animate-pulse`, mirror final layout.

---

## 5. RTL/LTR · Motion · Reduced Motion

**RTL/LTR**
- EN → `dir="ltr"`, font Inter. Persian → `dir="rtl"`, font Vazirmatn/IRANSansX.
- Every component must support both; no component may break layout.
- **Use logical properties:** `padding-inline`, `margin-inline`, `inset-inline` (not left/right).

**Motion tokens** (subtle, professional, functional — never decorative)
- `--transition-fast: 150ms ease` · `--transition-base: 250ms ease` · `--transition-slow: 400ms ease`.
- Page entry: opacity 0→1, translateY 10px→0, `--transition-slow`.
- Card reveal: staggered 50ms per item.
- Hover: buttons slight scale + brightness; cards lift + shadow; logos subtle emphasis. Aggressive animation prohibited.

**Reduced motion:** support `prefers-reduced-motion` → no transform animation, no motion-based nav, no forced animation.

**Accessibility:** contrast ≥ 4.5:1 · interactive target ≥ 44px · font ≥ 14px · `:focus-visible` everywhere · **focus ring 2px solid `#C7156F` (`--color-accent-blend`), never removable** · semantic HTML (`header/main/section/article/footer`) · skip-nav link (hidden, visible on focus) · alt text / labels / aria.

---

## 6. Tailwind CSS v4 `@theme` Mapping (DB-overridable via ThemeSetting)

Two-layer model: **runtime CSS vars** on `:root` (overwritten at runtime by ThemeSetting), and a **`@theme`** block that references them so Tailwind utilities (`bg-brand-primary`, `text-text-secondary`, `rounded-lg`, `font-fa`…) stay stable while values change.

```css
/* runtime layer — ThemeSetting writes these (DB-overridable) */
:root {
  /* text */
  --color-text-primary: #09122C; --color-text-secondary: #5B6475;
  --color-text-muted: #8A94A6;   --color-text-inverse: #FFFFFF;
  /* surfaces */
  --color-white: #FFFFFF; --color-bg: #F8FAFC; --color-surface: #FFFFFF;
  --color-surface-alt: #F1F4F9; --color-border: #E6EAF0; --color-border-strong: #CDD4E0;
  /* semantic */
  --color-success: #16A34A; --color-warning: #F59E0B;
  --color-error: #DC2626;   --color-info: #2563EB;
  /* accent */
  --color-accent-left-start: #FF8255; --color-accent-left-end: #FFA27E;
  --color-accent-right-start: #E4007F; --color-accent-right-end: #FF40A3;
  --color-accent-blend: #C7156F;
  /* brand roles (ThemeSetting: --brand-*) */
  --brand-primary: #E4007F; --brand-secondary: #FF8255; --brand-accent: #C7156F;
  /* gradients — LOGO and CTA are distinct */
  --gradient-logo: linear-gradient(135deg, #FF8255, #E4007F);   /* logo/brand ONLY */
  --gradient-cta:  linear-gradient(135deg, #E4007F, #FF40A3);   /* CTA only (CTA tokens) */
  --gradient-soft: linear-gradient(135deg, #FFF1EC, #FBE3F0);
  /* focus */
  --focus-ring: #C7156F;
}

@theme {
  /* colors -> bg-*/text-*/border-* utilities */
  --color-text-primary: var(--color-text-primary);
  --color-text-secondary: var(--color-text-secondary);
  --color-text-muted: var(--color-text-muted);
  --color-text-inverse: var(--color-text-inverse);
  --color-bg: var(--color-bg);
  --color-surface: var(--color-surface);
  --color-surface-alt: var(--color-surface-alt);
  --color-border: var(--color-border);
  --color-border-strong: var(--color-border-strong);
  --color-success: var(--color-success);
  --color-warning: var(--color-warning);
  --color-error: var(--color-error);
  --color-info: var(--color-info);
  --color-brand-primary: var(--brand-primary);
  --color-brand-secondary: var(--brand-secondary);
  --color-brand-accent: var(--brand-accent);
  --color-accent-blend: var(--color-accent-blend);

  /* fonts -> font-en / font-fa */
  --font-en: "Inter", "Segoe UI", sans-serif;
  --font-fa: "Vazirmatn", "IRANSansX", sans-serif;

  /* type scale -> text-* */
  --text-h1: 56px;       --text-h1--line-height: 1.1;  --text-h1--letter-spacing: -0.01em; --text-h1--font-weight: 700;
  --text-h2: 40px;       --text-h2--line-height: 1.2;  --text-h2--font-weight: 600;
  --text-h3: 24px;       --text-h3--line-height: 1.3;  --text-h3--font-weight: 600;
  --text-h4: 20px;       --text-h4--line-height: 1.35; --text-h4--font-weight: 600;
  --text-h5: 18px;       --text-h5--line-height: 1.4;  --text-h5--font-weight: 600;
  --text-h6: 16px;       --text-h6--line-height: 1.45; --text-h6--font-weight: 600;
  --text-body-lg: 18px;  --text-body-lg--line-height: 1.6;
  --text-body: 16px;     --text-body--line-height: 1.6;
  --text-small: 14px;    --text-small--line-height: 1.4;

  /* spacing -> p-*/m-*/gap-* (named, 8px grid) */
  --spacing-1: 8px;  --spacing-2: 16px; --spacing-3: 24px; --spacing-4: 32px;
  --spacing-5: 48px; --spacing-6: 64px; --spacing-7: 96px; --spacing-8: 120px;

  /* radius -> rounded-* */
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 20px; --radius-pill: 999px;

  /* shadows -> shadow-* */
  --shadow-sm: 0 2px 8px rgba(0,0,0,.06);
  --shadow-md: 0 6px 20px rgba(0,0,0,.08);
  --shadow-lg: 0 12px 40px rgba(0,0,0,.12);

  /* breakpoints -> sm:/md:/lg:/xl: */
  --breakpoint-mobile: 390px; --breakpoint-tablet: 768px;
  --breakpoint-laptop: 1280px; --breakpoint-desktop: 1440px;

  /* container max */
  --container-page: 1200px;

  /* motion */
  --transition-fast: 150ms ease; --transition-base: 250ms ease; --transition-slow: 400ms ease;
}

/* gradients are CSS vars (not Tailwind color utils): use bg-[image:var(--gradient-cta)] */

/* a11y: non-removable focus ring */
:where(a,button,input,select,textarea,[tabindex]):focus-visible {
  outline: 2px solid var(--focus-ring); outline-offset: 2px;
}

/* reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,*::before,*::after { animation-duration:.01ms!important; transition-duration:.01ms!important; }
}

html[lang="fa"], [dir="rtl"] { font-family: var(--font-fa); direction: rtl; }
html[lang="en"], [dir="ltr"] { font-family: var(--font-en); direction: ltr; }
```

**ThemeSetting override contract:** ThemeSetting writes `:root` custom properties (`--brand-primary`, `--brand-secondary`, `--brand-accent`, `--gradient-logo`, `--gradient-cta`, `--color-*`, logos, brand name, tagline, social, contact). `@theme` references those vars, so theme changes propagate globally with **no code/component/layout changes**. Never hardcode brand colors/logos in components.
