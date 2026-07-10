# Figma Deliverable Specification

## Required Figma Structure

The Figma file must include:

```text
Page 1: Cover and brief
Page 2: User flows
Page 3: Design system
Page 4: Components
Page 5: Mobile screens
Page 6: Tablet screens
Page 7: Desktop screens
Page 8: Responsive comparison
Page 9: Prototype notes
Page 10: Accessibility and QA
```

For smaller projects, combine pages but keep the same sections.

## Responsive Comparison Page

The Figma file must include one dedicated comparison page where every important screen is shown across all required resolutions side by side.

This page exists for frontend implementation. It lets engineers compare layout, spacing, hierarchy, visibility, and component behavior without jumping between pages.

### Required Comparison Layout

For each screen, create one horizontal row:

```text
Screen/Home
├── 360 mobile
├── 393 mobile
├── 768 tablet
├── 1024 small desktop
├── 1440 desktop
└── 1728 large desktop
```

If the product does not need all sizes, document the reason. Do not silently omit a breakpoint.

### Required Resolutions

Use these comparison frames by default:

```text
360 x 800: smallest supported mobile
393 x 852: standard modern mobile
768 x 1024: tablet portrait
1024 x 768: tablet landscape / small desktop
1440 x 1024: standard desktop
1728 x 1117: large desktop
```

For mobile apps, also include platform-specific frames when relevant:

```text
iPhone compact
iPhone standard
iPhone large
Android compact
Android standard
```

### Responsive Difference Notes

Place short implementation notes above or beside each row:

```text
Layout shift:
Navigation:
Content priority:
Hidden/collapsed elements:
Grid columns:
Spacing changes:
Typography changes:
Sticky/fixed elements:
Overflow behavior:
Developer notes:
```

### Breakpoint Change Markers

Mark every intentional responsive change with a small annotation label:

```text
BP: 640px - cards collapse to 1 column
BP: 768px - bottom nav becomes sidebar
BP: 1024px - filters move from drawer to toolbar
BP: 1280px - secondary analytics panel becomes visible
```

Do not leave frontend engineers to infer responsive behavior from visuals alone.

### Side-by-Side Rules

- Align all frames in a row by their top edge.
- Keep consistent spacing between comparison frames.
- Use the same content across breakpoints unless content intentionally changes.
- If content is hidden at a breakpoint, annotate where it moves or how it is accessed.
- If a component changes form, show both forms in the component page and reference the variant name.
- Highlight layout differences with subtle annotation lines, not decorative shapes.
- Include at least one long-content stress test row for screens with cards, lists, tables, or forms.
- Include an empty/error/loading comparison row for critical workflows.

## Cover Page

Include:

- Product name
- Design direction
- Target user
- Primary workflow
- Screen count
- Version/date
- Key assumptions

## User Flow Page

Include:

- Entry points
- Main path
- Alternate paths
- Error/recovery paths
- Success endpoint
- Back/cancel behavior

## Design System Page

Include:

- Color styles
- Text styles
- Spacing scale
- Radius scale
- Shadow/elevation scale
- Icon rules
- Grid rules
- Breakpoints

## Component Page

Include components and variants for:

- Buttons
- Inputs
- Selects
- Checkboxes
- Radios
- Toggles
- Tabs
- Navigation items
- Cards
- Tables
- Badges
- Avatars
- Modals
- Drawers
- Toasts
- Empty states
- Loading skeletons
- Error states

## Screen Requirements

Each screen frame must include:

- Clear screen name
- Primary state
- Important alternate states
- Annotations for responsive behavior
- Annotations for interactions
- Accessibility notes where needed
- Breakpoint notes when layout changes
- Developer handoff notes for spacing, grid, and visibility changes

## Senior Designer Additions

A senior-level Figma delivery must include the design decisions that make implementation predictable.

Include:

- A content priority map for each responsive screen.
- A component behavior matrix for breakpoint-specific variants.
- A state coverage map showing which screens have default, loading, empty, error, success, and disabled states.
- A density note explaining whether the screen is optimized for scanning, decision-making, data entry, reading, or exploration.
- A "do not change" list for critical UX decisions that frontend should preserve.
- A "safe to adapt" list for details frontend may adjust during implementation.

### Content Priority Map

Use this format:

```text
Always visible:
Visible after scroll:
Collapsed into menu/drawer:
Hidden until user action:
Removed on mobile:
```

### Component Behavior Matrix

Use this format:

```text
Component:
Mobile:
Tablet:
Desktop:
Large desktop:
Notes:
```

Example:

```text
Component: Filters
Mobile: bottom sheet
Tablet: collapsible drawer
Desktop: horizontal toolbar
Large desktop: toolbar + saved views panel
Notes: Preserve selected filter chips across all breakpoints.
```

## Prototype Requirements

Prototype must define:

- Start frame
- Main navigation
- Primary CTA behavior
- Back/cancel behavior
- Modal open/close behavior
- Form validation behavior
- Loading-to-result behavior for async actions
- Error recovery behavior

## Annotation Format

Use short annotations next to frames:

```text
Purpose:
Primary action:
Responsive behavior:
Keyboard behavior:
State notes:
Accessibility:
Content notes:
```

## Handoff Requirements

Design must be handoff-ready:

- Named styles
- Named components
- Component variants
- Auto-layout applied
- Constraints set
- Realistic content
- No hidden draft artifacts
- No unnamed frames/groups
- No disconnected duplicate components
- No final UI built only from screenshots
- Responsive comparison frames exist for every key screen
- Breakpoint annotations are explicit
- Component variants are referenced by name
- Content priority is documented for responsive changes
- Long-content and overflow behavior is documented

## Figma Technical Rules for Agents

If using the Figma API or MCP:

- Create or find a section before creating screens.
- Load fonts before creating or editing text.
- Use normalized RGB values for fills.
- Add children to auto-layout parents before setting fill sizing.
- Use fixed width and height for circular elements.
- Use valid overflow values: `NONE`, `HORIZONTAL`, `VERTICAL`, `BOTH`.
- Use prototype actions in the correct reaction format.
- Set flow starting points at the page level.

## Final Figma QA

- [ ] Pages are organized.
- [ ] Frames are named.
- [ ] Components are named.
- [ ] Variants exist for important states.
- [ ] Auto-layout is used consistently.
- [ ] Tokens/styles are applied.
- [ ] Mobile, tablet, and desktop frames exist where required.
- [ ] All required resolutions are shown side by side on the responsive comparison page.
- [ ] Breakpoint changes are annotated instead of implied.
- [ ] Content priority is documented for each key responsive screen.
- [ ] Long-content stress tests exist for important list, card, table, and form screens.
- [ ] Prototype links work.
- [ ] Focus and keyboard notes exist.
- [ ] Empty/loading/error/success states exist.
- [ ] Design is ready for implementation handoff.
