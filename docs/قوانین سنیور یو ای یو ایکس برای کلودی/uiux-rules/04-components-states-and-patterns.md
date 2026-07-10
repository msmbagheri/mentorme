# Components, States, and Patterns

## Universal Component Requirements

Every interactive component must define:

- Default state
- Hover state where hover exists
- Pressed/active state
- Focus-visible state
- Disabled state
- Loading state when async
- Error state when validation can fail
- Success/confirmed state when feedback is needed

## Buttons

### Hierarchy

- Primary: filled, one per decision area.
- Secondary: outline or subtle background.
- Tertiary: ghost/text.
- Destructive: danger color, confirmation for irreversible actions.

### Sizes

```text
small: 28-32px high
medium: 36-40px high
large: 44-56px high
mobile primary: 48-56px high
```

### Rules

- Labels must be specific verbs: "Save draft", "Send invite", "Create project".
- Avoid vague labels: "OK", "Submit", "Continue", "Click here".
- Do not put two filled CTAs next to each other.
- Destructive actions should not sit directly beside the primary positive action without clear separation.
- Icon-only buttons need tooltips and accessible labels.

## Forms

### Structure

- Label above input.
- Helper text below input when helpful.
- Error text below input.
- Required fields clearly marked.
- Related fields grouped with headings or fieldsets.

### Validation

- Validate on blur or submit, not aggressively on every keystroke.
- Preserve user input after errors.
- Error messages must say what happened and how to fix it.
- Use inline validation near the field.
- For multi-step forms, validate each step before advancing.

### Form Anti-Patterns

- Placeholder-only labels.
- Removing data after submission fails.
- Errors only shown at the top.
- Generic "Something went wrong".
- Too many fields in the first step.
- No review before irreversible or financial actions.

## Navigation

### Top Navigation

- Logo left.
- Primary nav center or left depending on layout.
- Account/action area right.
- 5-7 visible items maximum.
- Primary CTA must be visually distinct.
- Mobile menu required below 768px for complex nav.

### Sidebar

- Use for persistent product areas.
- Active item must be visible through background, color, weight, or indicator.
- Group related items.
- Avoid mixing unrelated destinations in one list.

### Tabs

- Use for sibling views of the same object.
- Tabs must not navigate to unrelated product areas.
- Active tab must be visually clear.
- Keyboard behavior should support arrow navigation.

### Breadcrumbs

- Use for deep hierarchies.
- Do not use breadcrumbs as a replacement for main navigation.

## Cards

Use cards when grouping, comparison, or elevation helps comprehension.

Rules:

- Cards in the same group should share anatomy.
- Card padding must be consistent.
- Avoid stuffing too much data into one card.
- Use whitespace before adding borders.
- Use cards for repeated items, modals, and framed tools, not as decoration for every section.

## Tables

Use tables for structured comparison, not for card-like content.

Rules:

- Headers must be sticky for long tables when useful.
- Numeric columns align right.
- Text columns align left.
- Sorting state must be visible.
- Filters belong above the table.
- Selected rows must trigger a contextual action bar.
- Pagination or virtualization is required for large data sets.
- On mobile, use horizontal scroll for dense data or a reduced card view for simpler records.

## Modals and Dialogs

Use for focused decisions, confirmation, or short tasks.

Rules:

- Trap focus inside the modal.
- Return focus to the trigger on close.
- Escape closes unless action is critical and needs explicit choice.
- Provide clear close/cancel path.
- Use sticky footer for long modals.
- Destructive confirmation must state the consequence.

## Drawers

Use drawers for secondary workflows that need context from the current page.

- Right drawer: details, filters, settings.
- Bottom sheet: mobile actions and selection.
- Drawer should not hide the only way to proceed.

## Toasts

Use for lightweight feedback.

- Success/info: polite live region.
- Error: assertive only when urgent.
- Do not steal focus.
- Auto-dismiss informational toasts.
- Do not auto-dismiss critical errors before the user can read them.

## Empty States

An empty state must include:

- What is empty
- Why it matters
- What the user can do next
- Primary action when applicable

Bad:

```text
No data found.
```

Good:

```text
No invoices yet. Create your first invoice to start tracking payments.
```

## Loading States

- Use skeletons shaped like the final content for pages, tables, and cards.
- Use inline button loading for button-triggered actions.
- Show progress or steps for operations longer than 5 seconds.
- Offer cancel for long-running AI or upload tasks.
- Avoid generic spinners as the only feedback for content-heavy screens.

## Error States

Errors must include:

- What failed
- Why it likely failed when known
- How to recover
- Whether data was saved or not

Bad:

```text
Error.
```

Good:

```text
Payment failed. Check the card details or use another payment method.
```

## AI Interface Patterns

For chat, generation, or AI builder products:

- Show prompt input with clear affordances.
- Support attachment state if attachments exist.
- Stream responses when possible.
- Give visible progress for long generation.
- Provide stop/cancel for long operations.
- Show version history for generated outputs.
- Show what changed after regeneration.
- Keep user agency clear: the user directs, the AI responds.

