# 03 — Wireframes & Layout Spec (UX)

Condensed structural/element-inventory spec for frontend component build. Visual styling lives in the UI Design System doc — this doc covers **structure, elements, grid, responsive behavior** only.

## Global System (applies to every screen)

- **Container:** max content width `1200px`. Padding: desktop `40px` / tablet `32px` / mobile `20px`. Same container on every section.
- **Grid:** desktop `12 col` / tablet `8 col` / mobile `4 col`, gutter `24px`.
- **Breakpoints:** desktop `1440`, laptop `1280`, tablet `768`, mobile `390`. Mobile-first, no horizontal scroll, touch-friendly, responsive images + type.
- **Vertical rhythm between sections:** desktop `120px` / tablet `96px` / mobile `72px`.
- **Section header pattern** (all sections except Hero & Footer): `Eyebrow (optional)` → `Title` → `Description` → `Content`. Spacing eyebrow→title `12px`, title→desc `16px`, desc→content `48px`.
- **CMS rule:** every visible element maps to a CMS field; no hardcoded business content. Menu items, CTAs, images, alt text all CMS-driven.
- **i18n:** EN (LTR) + Persian (FA, RTL). Every layout must render correctly mirrored in RTL with no breakage.
- **A11y:** keyboard nav, visible focus, ARIA labels, screen-reader support. Min touch target `44px`. Respect reduced-motion. Mobile buttons full-width min height `56px`. No text below `14px`.
- **Analytics hooks (build-ready, no redesign later):** CTA clicks, lead conversion, event registration, scroll depth, grade-funnel selection.

---

## 1. HOMEPAGE — 13 sections, mandatory order

Order is fixed (trust-flow). Admin may toggle visibility but cannot reorder/break the sequence: `hero → as_seen_in → methodology → why_choose_us → brand_philosophy → services → success_stories → founder_message → team → events → final_cta → footer`.

### 01 — Header (`sticky`, top of page)
- **Desktop row, 3 zones:** Logo `20%` | Nav `60%` | Primary CTA `20%`.
- **Nav items (CMS Menu):** About, Services, Results, Team, Events, Contact. None hardcoded; each item is scroll-to-anchor, internal page, or external URL.
- **Primary CTA:** single, resolved via CTA Config (e.g. Book Consultation / Get Started / Schedule Call).
- **Sticky scroll behavior:** before scroll = transparent/light bg; after scroll = solid bg + subtle shadow.
- **Tablet/Mobile:** Logo left, hamburger right. Primary CTA moves **into** the mobile menu.
- **Locale switcher:** lives in header cluster (near CTA on desktop; inside overlay on mobile) — toggles EN/FA and flips LTR/RTL.

### 02 — Hero (no section-header pattern)
- **Desktop:** two columns `50/50` — left = content, right = hero image (`4:5`). **Tablet & Mobile:** stacked (content above image).
- **Left content order:** Eyebrow → Headline → Subheadline → **Grade Selector** → CTA Group → Trust Indicator.
- **Headline:** ≤10 words (ideal 6–8), student-outcome focused.
- **Subheadline:** max-width `560px`, ≤3 lines.
- **CTA Group:** Primary (highest priority) + Secondary (lower), `16px` gap.
- **Trust Indicator** (below CTAs): one of rating / student count / acceptance metric / mini-testimonial / media mention.
- **Hero image:** human/authentic/mentorship, not stock; CMS image + alt.

### 03 — As Seen In (`immediately below hero`)
- **Structure:** section label + logo grid. Logos 6 min / 8 recommended / unlimited max.
- **Per logo fields:** image, alt text, URL (optional → clickable only if present), sort order, active flag.
- **Desktop:** single row, equal distribution, equal visual weight, consistent height (max `48px`). Subtle hover, no aggressive motion.
- **Mobile:** horizontal scroll **or** two rows.

### 04 — Methodology
- **Structure:** section header + step grid. Steps 3 min / **4 recommended** / 5 max.
- **Card fields:** Step Number (`01`–`04`, large, top-left) → Icon (`64px` fixed) → Title → Description (≤4 lines).
- **Cards:** equal height, consistent padding, subtle hover elevation.
- **Desktop:** 4 equal cards, single row. **Tablet:** `2×2` grid. **Mobile:** vertical stack.

### 05 — Why Clients Choose Us
- **Structure:** section header → Featured Review (full-width) → 3 Value-Proposition cards.
- **Featured Review block (vertical order):** Quote (≤5 lines) → Reviewer Name → Reviewer Role → Rating (prominent) → Read More CTA.
- **Value cards (exactly 3):** Icon → Title → Description. Answer "Why us / Why trust / Why now".
- **Desktop:** Row 1 review full-width; Row 2 = 3 columns. **Mobile:** Review → Card 1 → Card 2 → Card 3 stacked.

### 06 — Brand Philosophy
- **Desktop:** two columns `45/55` — left = image, right = Title + Content + single low-pressure CTA (e.g. Learn More / Our Approach / Meet The Team).
- **Content** explains mission/values/philosophy/approach (never pricing/packages/offers); max-width `600px`.
- **Tablet/Mobile:** stack (image then content).

### 07 — Services
- **Structure:** section header + service grid. Services 3 min / **6 recommended** / unlimited. Homepage shows **featured** services only.
- **Card fields:** Image (`16:10`) → Title (≤2 lines) → Short Description (≤4 lines) → text CTA (Explore Service / Learn More / View Details).
- **Cards:** fully clickable, accessible, equal height, consistent spacing; each links to a Service Detail page.
- **Desktop:** 3 col. **Tablet:** 2 col. **Mobile:** 1 col.

### 08 — Success Stories
- **Structure:** section header + grid **or** slider. Stories 3 min / unlimited; homepage shows featured.
- **Card fields:** Photo (`1:1`) → Name → **Outcome badge** (prominent, near top) → Story (≤5 lines) → CTA (View Case Study / Read Full Story).
- Each links to a Case Study Detail page.
- **Desktop:** 3/row. **Tablet:** 2/row. **Mobile:** single column or slider.

### 09 — Founder Message
- **Desktop:** two columns `40/60` — left = founder image (professional/warm), right = content.
- **Content order:** Name → Role → Message (long-form, comfortable line length, authentic — not sales copy) → Signature (bottom).
- **Tablet/Mobile:** stack (image then content).

### 10 — Team
- **Structure:** section header + team grid. Members 4 min / **8 recommended initial** / unlimited. Grouped by Team Category.
- **Card fields:** Photo (`1:1`, rounded rect, consistent) → Name (≤2 lines) → Role (single line, muted) → Bio (≤4 lines) → "View Profile" CTA + LinkedIn CTA.
- Each member links to a dedicated Profile page.
- **Desktop:** 4 col. **Tablet:** 2 col. **Mobile:** 1 col.

### 11 — Events & Webinars
- **Structure:** section header + event grid. Events 3 min / **4–6 recommended** / unlimited.
- **Card fields:** Image (`16:9`) with **Date Badge** (top-left overlay, high-visibility) → Title → Time → Location → Description (≤4 lines) → Primary CTA "Register" → Secondary CTA "View Details".
- **Registration methods:** lead form / Calendly / Cal.com / external URL.
- Each links to an Event Detail page.
- **Desktop:** 3 col. **Tablet:** 2 col. **Mobile:** 1 col.

### 12 — Final CTA (`immediately before footer`)
- **Layout:** centered, single focus, subtle non-distracting background image.
- **Order:** Headline (largest on page, ≤2 lines) → Description (max-width `700px`) → Primary CTA (highest priority) → Secondary CTA (lower) → Trust Statement (directly below CTA group).

### 13 — Footer (no section-header pattern, fully CMS-controlled)
- **Desktop:** 4 columns — Col1 Logo + brand description / Col2 Navigation / Col3 Services / Col4 Contact info.
- **Bottom bar:** Copyright, Privacy Policy, Terms, Social links (all editable).
- **Mobile:** columns stack vertically; bottom bar wraps.

---

## 2. Hero Grade Selector (interaction)

- **Purpose:** personalized funnel routing. **Mandatory.** Grades generated dynamically from CMS — never hardcoded.
- **Options:** Grade 6, 7, 8, 9, 10, 11, 12, Transfer Student (8 total).
- **States per option:** Default / Hover / Selected / Disabled (styling per UI system; do not reuse logo gradient improperly).
- **Layout by breakpoint:**
  - Desktop: horizontal row.
  - Tablet: wrap grid.
  - Mobile: stacked pills (full-width touch targets).
- **Funnel routing on select (analytics-tracked):** Grade 6–8 → Awareness (early planning) · Grade 9 → Foundation (long-term planning) · Grade 10–11 → Strategy (profile optimization) · Grade 12 → Urgency (application support) · Transfer → Transfer (transfer planning). Selection sets `grade` carried into lead capture.

---

## 3. Detail Page Layouts

All detail pages: same global container/grid, sticky header + footer, CMS-driven, independent SEO (meta title/desc, OG, canonical, structured data), RTL/LTR.

### Service Detail (`/services/[slug]`)
- Header/hero block: Title + short description + primary CTA + service image.
- Full description body (long-form, CMS `fullDescription`).
- Related/contextual CTA (resolved via CTA Config) → lead capture.
- Structured data: Service schema.

### Case Study Detail (`/case-studies/[slug]`)
- Hero: student Name, Title, **Outcome badge**, photo.
- Full story body (`fullStory`).
- Conversion CTA at end.
- Structured data: Article schema.

### Team Profile (`/team/[slug]`)
- Header: Photo, Name, Role, Category, location.
- Full bio body (`fullBio`).
- Links: LinkedIn, email; specialty tags.
- CTA to book/contact.
- Structured data: ProfilePage schema.

### Event Detail (`/events/[slug]`)
- Hero: Image, Date badge, Title, Time, Location, timezone.
- Full content body; capacity (optional).
- **Registration zone:** inline lead form **or** embedded Calendly/Cal.com **or** external registration link (per event config). Registration writes EventRegistration + Lead.
- Structured data: Event schema.

### Contact Page (`/contact`)
- Lead capture form (single column on mobile, touch-friendly): First name, Last name, Email, Phone, Grade (optional), Country, message/notes.
- Supporting trust column: contact info, social links, optional map/office.
- Submit → `POST /api/leads`; sets `source`, optional `grade` from funnel.

---

## 4. Admin Panel Layouts

Follows UI Design System. Secure, role-based (ADMIN full / EDITOR content+media+leads+SEO, no users / VIEWER read-only). Server-side RBAC; viewer hides all write controls.

### Sidebar Nav (information architecture, top→bottom)
Dashboard · Pages · Homepage · Services · Case Studies · Testimonials · Team Members · Events · Leads · Media Library · Menus · CTA Manager · Theme Manager · SEO · Users · Audit Logs · Settings.

### Dashboard (modular widgets)
- Lead Overview (counts/KPIs) · Recent Leads · Lead Status Breakdown (NEW/CONTACTED/QUALIFIED/CONVERTED/CLOSED) · Upcoming Events · Published Content Summary · Recent Content Activity · System Status · Quick Actions.

### List/Table + Detail/Editor pattern (Services, Case Studies, Events, Team, Testimonials, etc.)
- **List view:** table with sortable columns, status chip (DRAFT/IN_REVIEW/PUBLISHED/ARCHIVED), active toggle, sort-order handle, search/filter, row actions (edit/preview/archive/delete), "New" button.
- **Editor view:** tabbed/sectioned form with **paired EN/FA fields** for every localized field, media picker (from Media Library, with alt EN/FA), CTA selector (CtaConfig dropdown), SEO sub-panel (meta EN/FA, OG, canonical, noindex/nofollow), sort/featured/active flags.
- **Content workflow controls:** Draft → Review → Published → Archived, with Preview / Publish / Unpublish / Archive / **Rollback** (version snapshots). Publish triggers revalidation.
- **Audit:** every create/update/delete/publish/archive/rollback logged.

### Homepage Builder UX
- One screen listing the 13 sections in **fixed trust-flow order**.
- Per section: visibility toggle (active/inactive) + "Edit" into that section's editor. **Reordering that breaks trust-flow is disabled** (order is enforced, not freely draggable).
- Section editors map 1:1 to content models (Hero, AsSeenIn logos, Methodology steps, Why-Choose value props + featured testimonial, Brand Philosophy, Services selection, Success Stories selection, Founder Message, Team, Events, Final CTA, Footer).
- Repeatable items (logos, steps, value props, cards) use add/remove/sort-order list editors with min/max enforcement (e.g. methodology 3–5, value props exactly 3).

### Lead Pipeline UI (`Leads`)
- **List/board:** filter by status, grade, source, assignee; columns by LeadStatus (NEW→CONTACTED→QUALIFIED→CONVERTED→CLOSED) for pipeline view; table view alternative.
- **Lead detail drawer/page:** contact fields (name, email, phone, grade, country, source), status selector, assignee selector (Unassigned / Counselor / Team Member / Admin), notes.
- **Activity timeline:** chronological LeadActivity entries (Lead Created, Email Sent, Phone Call, Consultation Scheduled, Qualified, Converted, Closed) with add-activity action.
- Status/assignment edits via `PATCH /api/admin/leads`.

### Supporting managers (form/list screens)
- **Media Library:** grid of assets, upload, alt EN/FA, type filter, used-in references; storage provider-agnostic.
- **Menus:** menu list → menu-item editor (label EN/FA, type SCROLL_TO_SECTION/INTERNAL_PAGE/EXTERNAL_URL, anchor/url, sort, active).
- **CTA Manager:** list of CtaConfig (internal name, label EN/FA, action type, URLs/calendly/calcom, active).
- **Theme Manager:** brand name, tagline EN/FA, logos (primary/dark/mobile/favicon), colors, CTA gradient, social links, contact info.
- **SEO:** per-page meta EN/FA, canonical, OG, noindex/nofollow, structured data.
- **Users:** list + role assignment (ADMIN only). **Audit Logs:** filterable action log. **Settings:** global config.

---

## 5. Header / Menu / Locale / Sticky Behavior

- **Sticky header:** always pinned top. Pre-scroll transparent/light → post-scroll solid + subtle shadow.
- **Mobile menu:** **fullscreen overlay**, accessible, touch-friendly. Contains: Navigation, Primary CTA, Social Links, Contact Information.
- **Locale switcher:** EN/FA toggle placed in header (desktop near CTA cluster; mobile inside the overlay). Switching flips document direction LTR↔RTL globally; all sections must mirror cleanly.
