# Product Brief and Design Direction

## Minimum Brief

Before designing, collect or infer:

- Product category
- Target users
- Primary user jobs
- Business goal
- Platform: web, mobile, desktop, responsive web, dashboard, landing page, admin panel, marketplace, app, or tool
- Brand attributes
- Domain vocabulary
- Required screens
- Required components
- Data complexity
- Accessibility requirements
- Known constraints

## Product Intent Template

```text
Product:
Audience:
Top 3 user jobs:
Primary workflow:
Business outcome:
Tone:
Density:
Trust level needed:
Content type:
Data complexity:
Platform:
```

## Domain Exploration

The design must come from the product world, not from generic UI trends.

Before choosing visuals, define:

- Domain concepts: at least 5 words or metaphors from the product's real world.
- Color world: at least 5 colors that naturally belong to the product context.
- Signature element: one visual, structural, or interaction idea that makes the product recognizable.
- Defaults to reject: at least 3 obvious patterns that would make the design generic.

Example:

```text
Domain concepts: settlement, ledger, confidence, review, risk, audit trail
Color world: paper white, graphite, deep green, amber warning, banknote gray
Signature: timeline ledger cards that show each decision as an auditable step
Rejecting: generic blue SaaS dashboard, 3 equal stat cards, vague "Get started" CTA
```

## Design Direction Options

Choose one primary direction. Do not mix unrelated directions.

### Precision and Density

Best for developer tools, admin systems, finance operations, analytics, and internal dashboards.

- Tight spacing
- Neutral palette
- Strong grids
- Monospace for data
- Borders and hairlines over dramatic shadows
- High information density

### Warmth and Approachability

Best for collaboration tools, education, creator tools, consumer productivity, and onboarding-heavy products.

- Generous spacing
- Soft neutral surfaces
- Friendly but disciplined typography
- Gentle illustrations or real imagery
- Plain-language copy

### Sophistication and Trust

Best for fintech, healthcare, enterprise B2B, security, and compliance-heavy products.

- Restrained palette
- Clear hierarchy
- Conservative motion
- Strong error prevention
- Visible auditability
- Credible data presentation

### Boldness and Clarity

Best for high-impact marketing pages, modern product showcases, and executive dashboards.

- High contrast
- Large focal areas
- Strong typographic rhythm
- Few but memorable visual elements
- Explicit CTA hierarchy

### Utility and Function

Best for GitHub-style tools, settings pages, documentation interfaces, and repeated workflows.

- Minimal decoration
- Familiar patterns
- Fast scanning
- Dense but calm layout
- Clear labels and keyboard-friendly controls

### Data and Analysis

Best for BI, analytics, reporting, monitoring, trading, and operational tools.

- Numbers-first hierarchy
- Tabular figures
- Chart color discipline
- Filters and comparison tools
- Empty and loading states shaped like the final data

## Choosing Density

Use density intentionally:

- Low density: onboarding, consumer apps, brand moments, early learning
- Medium density: SaaS apps, forms, settings, account areas
- High density: admin tools, dashboards, professional workflows, data tables

Density must match user expertise. New users need more guidance. Expert users need speed, keyboard support, and information proximity.

## Information Architecture Rules

- Navigation must match the user's mental model, not the database model.
- Limit top-level navigation to 5-7 items.
- Group secondary actions into menus, drawers, or contextual toolbars.
- Use breadcrumbs for deep hierarchies.
- Use tabs for sibling views of the same object.
- Use side navigation for persistent product areas.
- Use bottom navigation only for 3-5 high-frequency mobile destinations.
- Never hide primary navigation behind mystery icons.

## Screen Planning Rules

For every screen, define:

```text
Screen name:
User goal:
Primary action:
Secondary actions:
Entry points:
Exit points:
Main content:
Empty state:
Loading state:
Error state:
Success state:
Responsive changes:
Accessibility notes:
```

