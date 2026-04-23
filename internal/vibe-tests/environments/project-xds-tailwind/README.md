# XDS + Tailwind CSS

This project uses XDS components for structured UI (cards, buttons, inputs, etc.)
and Tailwind CSS utilities for layout, spacing, and custom styling.

## Usage Pattern

Use XDS components for interactive/semantic elements:

```tsx
import {XDSCard, XDSButton, XDSVStack, XDSHeading, XDSText} from '@xds/core';
```

Use Tailwind utility classes for layout and customization:

```tsx
<main className="flex min-h-screen items-center p-8">
  <XDSCard className="max-w-md">
    <XDSVStack gap={4}>
      <XDSHeading level={2}>Dashboard</XDSHeading>
      <XDSButton label="Save" variant="primary" />
    </XDSVStack>
  </XDSCard>
</main>
```

## XDS Tailwind Bridge

XDS tokens are available as native Tailwind utilities. Instead of:

```tsx
<div className="bg-[var(--color-background-surface)]">
```

Write:

```tsx
<div className="bg-surface text-primary rounded-lg p-4">
```

Available token utilities include: `text-primary`, `text-secondary`, `bg-surface`,
`bg-card`, `bg-muted`, `border-default`, `text-error`, `bg-success`, and many more.

## Component Docs

Run `npx xds component <Name>` to look up component props and usage.
Run `npx xds component --list` to see all available components.

## Key Rules

- XDS components accept `className` — Tailwind utilities override XDS styles
- Use XDS components for semantic UI (buttons, cards, inputs, headings, text)
- Use Tailwind for layout (`flex`, `grid`, `gap-*`, `p-*`, `m-*`)
- Use bridge tokens (`bg-surface`, `text-primary`) instead of raw CSS variables
- All XDS components are imported from `@xds/core`
