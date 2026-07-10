# Accessibility and Inclusive Design

## Standard

All designs must target WCAG 2.2 AA at minimum.

Accessibility is not optional and not delayed until development. It must be visible in the design file through annotations, states, focus order, and component variants.

## Contrast

Minimum ratios:

```text
Normal text: 4.5:1
Large text: 3:1
UI components and graphical objects: 3:1
Focus indicators: clearly visible against adjacent colors
```

Rules:

- Do not use light gray text on white.
- Do not use low-contrast placeholder text as a replacement for labels.
- Do not communicate status through color alone.
- Test text on every surface where it appears.

## Keyboard Accessibility

Every interactive element must be reachable and usable by keyboard.

Expected behavior:

- Tab moves through interactive controls in visual/logical order.
- Enter or Space activates buttons.
- Arrow keys navigate tabs, menus, radio groups, and listbox-style widgets.
- Escape closes modals, popovers, menus, and non-critical overlays.
- Home and End jump to first/last item in long composite widgets where appropriate.

## Focus Rules

- Every focusable element needs a visible focus state.
- Focus order must match the visual order.
- Do not use hidden focus traps.
- On modal open, focus moves into the modal.
- On modal close, focus returns to the trigger.
- Do not remove focus outlines without replacing them.

## Screen Reader Rules

Design annotations must specify:

- Page title
- Heading hierarchy
- Landmark regions
- Button labels
- Icon-only control labels
- Error announcement behavior
- Live regions for async updates

Rules:

- One H1 per page or view.
- Headings must not skip levels.
- Decorative images use empty alt text.
- Informative images need concise alt text.
- Complex charts need a text summary.
- Dynamic status updates use live regions.

## Touch Accessibility

- Minimum target: 44x44px.
- Recommended target: 48x48px.
- Space between touch targets: at least 8px where possible.
- Destructive actions should be harder to trigger accidentally.
- Mobile primary actions should appear near thumb reach unless the workflow requires otherwise.

## Motion Accessibility

- Respect reduced motion preferences.
- Avoid essential information conveyed only by animation.
- Do not use flashing content.
- Motion should show cause and effect.
- Use 150-300ms for micro-interactions.
- Avoid motion longer than 500ms for routine UI actions.

## Cognitive Accessibility

- Use familiar patterns.
- Use progressive disclosure for advanced settings.
- Chunk long forms into clear groups.
- Provide defaults.
- Keep choices to 5-7 per group where possible.
- Avoid unexpected navigation after actions.
- Make undo, cancel, back, and close paths visible.

## Inclusive Language

- Use gender-neutral language.
- Use plain, respectful language.
- Avoid ableist phrases.
- Avoid blaming users for errors.
- Avoid jokes in errors, security, finance, healthcare, or destructive workflows.
- Avoid "just", "simply", and "easy" in instructions because they can dismiss user effort.

## Accessibility Annotation Template

For each screen, include:

```text
Keyboard order:
Focus start:
Focus return:
Heading structure:
Landmarks:
Live regions:
Alt text:
Error announcement:
Reduced motion behavior:
Contrast notes:
Touch target notes:
```

## Accessibility QA Checklist

- [ ] Contrast meets AA.
- [ ] All controls have visible labels or accessible names.
- [ ] Icon-only buttons have labels.
- [ ] Focus states are designed.
- [ ] Keyboard order is logical.
- [ ] Modal focus is trapped and returned.
- [ ] Errors are linked to fields.
- [ ] Dynamic updates are announced.
- [ ] Motion has reduced-motion alternative.
- [ ] Touch targets meet minimum size.
- [ ] Color is not the only state signal.

