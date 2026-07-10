# UI/UX Rules for AI Design Agents

Use this folder as a design operating system for AI agents that create Figma screens, prototypes, or UI specifications. The rules are written to replace vague taste feedback with explicit senior-level constraints.

## How to Use

Give the agent these files before asking for UI/UX work:

1. `00-agent-operating-contract.md`
2. `01-product-brief-and-design-direction.md`
3. `02-design-system-foundations.md`
4. `03-layout-responsive-and-figma.md`
5. `04-components-states-and-patterns.md`
6. `05-accessibility-and-inclusive-design.md`
7. `06-ux-writing-and-content.md`
8. `07-quality-review-and-anti-patterns.md`
9. `08-figma-deliverable-spec.md`

For small tasks, attach `00`, `02`, `05`, and `07` at minimum.

## Core Standard

Every generated design must be:

- Intentional: every visual choice must connect to a user, task, and product context.
- Systematic: no random colors, spacing values, typography, icons, radii, or shadows.
- Accessible: WCAG 2.2 AA minimum, keyboard-friendly, readable, and inclusive.
- Responsive: mobile-first, tablet-ready, desktop-ready, and free of horizontal overflow.
- Complete: default, hover, active, focus, disabled, loading, empty, error, and success states where applicable.
- Figma-ready: named layers, auto-layout, tokenized styles, components, variants, and annotations.

## Required Agent Behavior

The agent must not jump directly into screens. It must first define:

- User and job-to-be-done
- Primary action per screen
- Visual hierarchy
- Information architecture
- Design direction
- Design tokens
- Component rules
- State model
- Accessibility constraints
- Quality review checklist

If any of those are missing from the user brief, the agent should apply conservative industry defaults and clearly state the assumptions.

## Source Inspiration

This rule set was synthesized from the provided resources, including UI/UX Cursor rules, design skill repos, product copy rules, Figma execution notes, anti-pattern libraries, and design-system references.

