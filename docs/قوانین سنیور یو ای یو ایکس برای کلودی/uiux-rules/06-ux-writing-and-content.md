# UX Writing and Content Rules

## Voice

Use clear, direct, useful product language.

The product should sound:

- Confident, not inflated
- Helpful, not patronizing
- Specific, not generic
- Calm, not performative
- Human, not chatty by default

## Core Writing Rules

- Use active voice.
- Use sentence case.
- Use concrete verbs.
- Keep labels short.
- Match copy to the user's task.
- Write one idea per sentence.
- Use parallel structure in lists, tabs, and navigation.
- Use numerals for numbers in UI.
- Use contractions where they sound natural.
- Do not end single-sentence labels, tooltips, or short UI fragments with periods.
- Use periods for multi-sentence copy.

## Button and Link Labels

Labels must describe the action.

Avoid:

```text
Submit
OK
Confirm
Continue
Click here
Learn more
Read more
Get started
```

Prefer:

```text
Create project
Send invite
Save draft
Review order
Restore version
Open dashboard
Compare plans
View pricing
```

## Error Messages

Error messages must say:

- What happened
- What to do next

Bad:

```text
Something went wrong.
```

Good:

```text
The upload failed. Check the file type and try again.
```

Rules:

- Do not over-apologize.
- Do not blame the user.
- Do not use humor in serious errors.
- Put field errors near the field.
- Preserve user input.

## Empty States

Write empty states as invitations, not dead ends.

Bad:

```text
No projects found.
```

Good:

```text
No projects yet. Create your first project to start organizing your work.
```

## Success Messages

Success states should confirm what changed.

Bad:

```text
Success.
```

Good:

```text
Your changes are saved.
```

For routine actions, stay calm. Reserve celebration for true milestones.

## Tooltips

Tooltips should clarify outcomes, not restate mechanics.

Bad:

```text
Click this button to export.
```

Good:

```text
Download this report as a CSV file.
```

Rules:

- Tooltips are not required for obvious controls with labels.
- Icon-only controls should have tooltips.
- Tooltips must not contain critical information needed to complete a task.

## Placeholder Text

- Placeholder text is not a label.
- Use short examples only when they help formatting.
- Do not put long instructions inside placeholders.

Good:

```text
name@company.com
```

Bad:

```text
Enter your email address here so we can contact you later
```

## Content Realism

Never use generic placeholder content in final mockups.

Avoid:

```text
John Doe
Jane Smith
Acme Corp
example@email.com
Lorem ipsum
99.99%
$10,000
```

Use realistic, context-specific content:

```text
Mina Carter
Riverside Dental
mina@riversidedental.com
47.2%
$8,247.30
```

## Marketing Copy Rules

- Be specific about the product outcome.
- Use proof near claims.
- Use one primary CTA above the fold.
- Avoid hype words: seamless, unleash, elevate, next-gen, revolutionary, game-changing, powerful.
- Avoid rhetorical question headlines unless the page is intentionally conversational.
- Avoid exclamation marks in serious products.
- Use product screenshots, diagrams, or real imagery to support claims.

## In-Product Copy Rules

- Prioritize task completion.
- Use familiar terms consistently.
- Keep navigation labels parallel.
- Use direct second person when useful.
- Keep settings and policy copy formal and precise.
- Keep destructive action copy explicit.

## Destructive Action Copy

Must include:

- Object being affected
- Consequence
- Whether it can be undone
- Clear cancel path

Example:

```text
Delete workspace
Deleting this workspace is permanent. Projects, files, and members will be removed.

Cancel
Delete workspace
```

