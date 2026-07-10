# Layout, Responsive Behavior, and Figma Execution

## Layout Principles

- Everything aligns to something.
- Use grids to create order, not to fill every column.
- Layout must create a clear reading path.
- Important content belongs near the user's focus and workflow.
- Do not create equal visual weight for unequal actions.
- Avoid generic 3-equal-card rows unless there is a strong content reason.
- Use asymmetry, bento grids, timelines, split panes, or detail panels when they better express hierarchy.

## Recommended Web Grid

Desktop:

```text
container max width: 1200-1400px
columns: 12
gutter: 24px
outer margin: 32-48px
```

Tablet:

```text
columns: 8
gutter: 16-24px
outer margin: 24px
```

Mobile:

```text
columns: 4
gutter: 12-16px
outer margin: 16px
```

## Common Layout Patterns

### Sidebar + Content

Use for dashboards, admin systems, and tools.

- Sidebar: 240-280px desktop.
- Collapsed sidebar: 56-72px.
- Sidebar surface should usually match the canvas with a subtle border.
- Content area must own the visual focus.

### Master Detail

Use for inboxes, CRMs, records, support tools, and settings.

- Left: list or navigation.
- Right: selected object detail.
- On mobile, split into separate screens.

### Data Dashboard

Use:

- Header with page title and key action.
- Filter toolbar.
- Metrics row.
- Main chart or table.
- Secondary panels.

Do not make every metric card identical if one metric is clearly more important.

### Form Flow

Use:

- One task per screen or step.
- Clear progress indicator for multi-step flows.
- Back action that preserves data.
- Review screen before irreversible submission.

### Landing Page

Use:

- Strong first-viewport product signal.
- One primary CTA.
- Real product visual, real imagery, or meaningful demo surface.
- Sections as chapters with varied rhythm.
- Proof close to claims.

## Responsive Rules

- Design mobile-first.
- Verify 360-390px width with no horizontal overflow.
- Show every key screen across all required resolutions side by side in Figma so frontend can compare responsive behavior without guessing.
- Every multi-column block collapses to one column at or below 640px unless a horizontal data table is intentionally scrollable.
- Primary mobile CTA should be reachable in the thumb zone.
- Short button labels, nav labels, and brand names should not wrap awkwardly.
- Avoid fixed widths that exceed the viewport.
- Use minimum and maximum widths for components.
- Use responsive constraints, not viewport-scaled font sizes.
- Use stable dimensions for controls, tiles, grids, and toolbar items to prevent layout shift.
- Annotate every intentional breakpoint change: navigation changes, column count changes, hidden content, moved actions, sticky behavior, and overflow behavior.
- Keep the same realistic content across breakpoints unless a content change is intentional and documented.

## Breakpoints

```text
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

Breakpoints should be content-driven. If a layout breaks before the next breakpoint, fix it there.

## Required Responsive Comparison Set

For important screens, create comparison frames in these sizes:

```text
360 x 800
393 x 852
768 x 1024
1024 x 768
1440 x 1024
1728 x 1117
```

Each comparison row must document:

- What changes at each breakpoint.
- Which content remains visible.
- Which content collapses into menus, drawers, accordions, or tabs.
- Which actions remain sticky or fixed.
- Which grids change column count.
- Which components switch variants.
- How overflow is handled.
- What frontend must preserve.

## Responsive Decision Matrix

Use this matrix for every key screen:

```text
Screen:
Breakpoint:
Grid:
Navigation:
Primary action:
Secondary actions:
Content priority:
Hidden/collapsed content:
Typography changes:
Spacing changes:
Component variant changes:
Overflow behavior:
Implementation notes:
```

## Senior Responsive Standards

- Mobile should prioritize task completion, not feature parity.
- Tablet should not be a stretched mobile view; use the extra width for context, preview, or secondary panels.
- Desktop should not be a widened tablet view; use width to improve scanning, comparison, and multi-tasking.
- Large desktop should not stretch content endlessly; cap reading and work areas, then use secondary regions intentionally.
- Navigation may change form across breakpoints, but labels, destinations, and mental model must remain consistent.
- Primary actions should remain findable across all breakpoints, even when their placement changes.
- Avoid hiding critical actions inside overflow menus on mobile.
- Avoid duplicating the same action in multiple places unless one is sticky and the other is contextual.
- If a table becomes cards on mobile, document exactly which columns become primary, secondary, metadata, or hidden.
- If filters move into a drawer on mobile, selected filters must remain visible as chips or summary text.

## Mobile Rules

- Touch targets: 44x44px minimum, 48x48px recommended.
- Input height: 48-56px.
- Button height: 44-56px.
- Bottom navigation: 3-5 items maximum.
- Use safe-area padding for top and bottom system UI.
- Avoid hover-only interactions.
- Avoid tiny icon-only actions unless they are familiar and labeled for accessibility.

## Figma Frame Sizes

Use these as starting points:

```text
Mobile: 393 x 852
Small mobile: 360 x 800
Tablet: 768 x 1024
Desktop: 1440 x 1024
Large desktop: 1728 x 1117
```

## Figma Auto-Layout Rules

- Use auto-layout for every repeated or structured component.
- Use fixed sizing for icons, avatars, circular buttons, and controls that must not stretch.
- Use hug content for text groups and intrinsic components.
- Use fill container only after the child is inside an auto-layout parent.
- Avoid manual positioning unless creating charts, maps, canvas tools, or intentionally layered visuals.
- Keep padding and gaps tied to the spacing scale.

## Figma Layer Naming

Use this naming convention:

```text
Screen/Dashboard
Section/Header
Section/Filters
Section/MainContent
Row/Toolbar
Card/MetricRevenue
Text/PageTitle
Text/Helper
Button/Primary
Button/Secondary
Input/Search
Icon/Search
Badge/Status
Table/Invoices
Modal/DeleteConfirmation
Toast/Error
```

## Figma Component Rules

Create components for:

- Buttons
- Inputs
- Selects
- Checkboxes
- Radio controls
- Toggles
- Tabs
- Badges
- Avatars
- Cards
- Modals
- Toasts
- Table rows
- Navigation items

Each interactive component should include variants:

```text
State=Default
State=Hover
State=Pressed
State=Focused
State=Disabled
State=Loading
State=Error
```

Use boolean, text, and instance properties for flexible components.
