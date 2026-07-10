# Design System Foundations

## Token Architecture

Use layered tokens. Never use random raw values directly in components.

### Primitive Tokens

Primitive tokens store raw choices:

```text
color.neutral.50
color.neutral.100
color.neutral.900
color.brand.500
space.1
space.2
radius.sm
shadow.sm
font.sans
```

### Semantic Tokens

Semantic tokens define meaning:

```text
color.text.primary
color.text.secondary
color.text.tertiary
color.surface.base
color.surface.raised
color.surface.overlay
color.surface.inset
color.border.subtle
color.border.default
color.border.strong
color.action.primary
color.action.primary.hover
color.state.success
color.state.warning
color.state.danger
```

### Component Tokens

Component tokens define local behavior:

```text
button.height.md
button.padding.x
input.height
input.border.focus
card.padding
modal.width.md
toast.duration
```

## Color Rules

- Use one primary accent color per product area.
- Color must communicate meaning: action, status, brand, selection, warning, danger, or data category.
- Do not use color as the only signal. Pair it with text, icon, position, or shape.
- Do not use pure black `#000000` or pure white `#FFFFFF` as the main visual pair in polished interfaces.
- Body text must meet at least 4.5:1 contrast.
- Large text and UI boundaries must meet at least 3:1 contrast.
- Disabled text may be lower contrast, but disabled controls must still be recognizable.
- Success is not always green if green is already the brand color; use semantic distinction.
- Destructive actions must be visually distinct and require confirmation when irreversible.

## Recommended Color Roles

Every design must define:

- Canvas/background
- Raised surface
- Overlay surface
- Inset surface
- Text primary
- Text secondary
- Text muted
- Border subtle
- Border default
- Border strong
- Primary action
- Primary action hover
- Focus ring
- Success
- Warning
- Danger
- Info
- Selection

## Typography Rules

- Use one primary UI type family.
- Use one mono family for code, IDs, and tabular data when needed.
- Do not use serif fonts in dashboards, admin tools, developer tools, or dense software UIs unless the brand requires it.
- Use sentence case for headings and UI labels.
- Body text in product UI should usually be 14-16px depending on density.
- Body text in marketing pages should usually be 16-18px.
- Use weight, color, and spacing together. Do not rely on size alone.
- Use tabular numbers for metrics, tables, prices, counters, and finance values.
- Keep paragraph width around 55-72 characters on desktop.

## Recommended Type Scale

```text
caption: 12px
label: 13px
body compact: 14px
body comfortable: 16px
section title: 18px
page subtitle: 20px
page title: 24px
display small: 30-36px
display large: 48-64px
```

## Line Height

```text
buttons/badges: 1.0
headings: 1.15-1.25
subheadings: 1.3-1.4
body: 1.5-1.65
long-form text: 1.6-1.75
```

## Spacing System

Use a 4px base system. All spacing should come from this scale:

```text
0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
```

Rules:

- Related items: 4-12px apart.
- Component internal spacing: 8-16px.
- Card or panel padding: 16-32px.
- Section gaps: 24-48px in apps, 48-96px in marketing pages.
- Space between groups should be at least 2x the space between items in the same group.
- Avoid arbitrary values like 5, 11, 17, 23 unless mathematically required.

## Radius Rules

Define 2-3 radius values plus full pill/circle.

```text
radius.sm: 4px
radius.md: 8px
radius.lg: 12px
radius.xl: 16px
radius.full: 999px
```

Rules:

- Small controls usually need smaller radius than large surfaces.
- Cards should usually be 8-12px in serious product UIs.
- Pill radius is reserved for badges, chips, segmented controls, and deliberate pill CTAs.
- Circular icon buttons must have equal width and height with radius equal to half the size.

## Depth and Elevation

Choose one depth strategy and commit:

- Borders-only: best for dense tools and admin dashboards.
- Subtle shadows: best for approachable SaaS and cards.
- Surface shifts: best for dark mode or minimal tools.
- Layered shadows: best for premium editorial or marketing surfaces.

Rules:

- Elevation should be quiet. If shadows are the first thing users notice, they are too strong.
- Do not mix dramatic shadows, heavy borders, glass, and background tints randomly.
- Higher elevation should appear closer through shadow, border strength, or surface lightness.
- Dropdowns, popovers, modals, and toasts must sit above their trigger surface.

## Icon Rules

- Use one icon family per product surface.
- Use one stroke width per hierarchy level.
- Icon-only buttons need accessible labels.
- Navigation icons should include text labels for new or broad audiences.
- Do not repeat the same icon across different concepts.
- Do not use icons as decoration when typography or layout would communicate better.

