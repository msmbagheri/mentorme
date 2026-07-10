# Quality Review and Anti-Patterns

## Pre-Delivery Review

Before presenting any design, run this review and fix failures.

## The Four Senior Checks

### 1. Squint Test

Blur your eyes or zoom out.

You must still be able to identify:

- Primary content area
- Primary action
- Navigation
- Secondary content
- Selected or active state

If everything looks equal, hierarchy is too weak.

### 2. Swap Test

Ask:

- If the typeface changed to the most common default, would the design feel the same?
- If the palette changed to generic blue and gray, would the design feel the same?
- If the layout changed to a generic sidebar and card grid, would the design feel the same?

If yes, the design lacks product-specific intent.

### 3. State Test

Every flow must include the states users actually experience:

- Default
- Loading
- Empty
- Error
- Success
- Disabled
- Focused
- Selected
- Overflow

If only the happy path exists, the design is incomplete.

### 4. Accessibility Test

Check:

- Contrast
- Keyboard order
- Focus states
- Labels
- Touch targets
- Motion preferences
- Error recovery
- Screen reader names

## Critical Anti-Patterns

Do not ship designs with:

- Multiple primary CTAs in the same decision area.
- No visible back/cancel/close path.
- Circular buttons stretched into ovals.
- Random colors with no semantic role.
- Inconsistent padding across the same component type.
- Mixed radius values without a system.
- Body text below readable size.
- Light gray text on white.
- Generic labels such as "Submit" or "OK".
- No loading feedback for async actions.
- Empty states that only say "No data".
- Errors that only say "Something went wrong".
- Modal without exit path.
- Components floating on the Figma canvas without structure.
- Placeholder content in final mockups.
- Icons from mixed families.
- Repeated identical icons for different concepts.
- Horizontal scroll on mobile except intentional data tables.
- Hover-only critical interactions.
- Motion that ignores reduced-motion preferences.
- Decorative gradients, glows, or blobs that do not serve the product.

## Visual Anti-Patterns

Avoid:

- Generic three-card feature rows.
- Centered hero as the default for every product.
- Purple-blue "AI" gradient as a default.
- Pure black and pure white as the whole palette.
- Heavy drop shadows on every card.
- Oversaturated accent colors across large surfaces.
- Decorative section numbers with no meaning.
- Random bento grids that do not express hierarchy.
- Cards inside cards.
- UI text that overlaps or wraps awkwardly.
- Same layout rhythm in every section.

## Typography Anti-Patterns

Avoid:

- Title Case for every heading.
- H1 wrapping into 4 or more lines.
- Body text longer than 75 characters per line.
- Too many font weights.
- Serif fonts in dense software UIs.
- All-caps body text.
- Tiny labels below 12px.
- Data numbers without tabular figures.

## Content Anti-Patterns

Avoid:

- "John Doe", "Jane Smith", "Acme", "Nexus", "SmartFlow".
- Round fake numbers like "100k", "99.99%", "$10,000".
- Hype verbs: elevate, unleash, transform, empower, revolutionize.
- Generic CTAs: "Get started", "Learn more", "Click here" as the only CTA.
- Unattributed testimonials.
- Generic stock photos that do not match the product context.
- Feature lists with no prioritization.

## Motion Anti-Patterns

Avoid:

- Scroll-jacking.
- Slow hover transitions.
- Linear easing for expressive UI transitions.
- Animating width, height, top, or left when transform and opacity would work.
- Infinite decorative loops.
- Confetti for routine success.
- Auto-rotating hero carousels.
- Sound autoplay.

## Final QA Checklist

- [ ] One primary action per screen or decision area.
- [ ] Visual hierarchy is clear at a glance.
- [ ] Design direction is specific to the product.
- [ ] Tokens exist for color, type, spacing, radius, shadow, and states.
- [ ] Spacing follows a 4px or 8px rhythm.
- [ ] Typography has distinct heading, body, label, and data styles.
- [ ] Components include important variants.
- [ ] Loading, empty, error, and success states are designed.
- [ ] Responsive behavior is defined for mobile, tablet, and desktop.
- [ ] Mobile has no accidental horizontal overflow.
- [ ] Accessibility notes are included.
- [ ] Figma layers and components are named clearly.
- [ ] Placeholder content has been replaced with realistic content.
- [ ] The design passes squint, swap, state, and accessibility tests.

