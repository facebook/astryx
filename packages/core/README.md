# @astryxdesign/core

Core UI components, theme system, and utilities for the XDS design system. For project setup, see [Quick Start](#quick-start) below.

## Component Docs

Look up any component's full API (props, types, best practices, and theming):

```bash
node node_modules/@astryxdesign/core/docs.mjs Button        # full docs for a component
node node_modules/@astryxdesign/core/docs.mjs --list         # list all components
node node_modules/@astryxdesign/core/docs.mjs --list --brief  # brief summaries
```

## Page Layouts

Building a full page? Start with a template rather than composing from scratch.
Templates are content-only; they compose `XDSLayout` with header, content, and
panel slots into common page patterns (dashboards, settings, forms, detail pages).
Wrap them in your own app chrome (`XDSAppShell`, `XDSTopNav`, `XDSSideNav`) to add
global navigation.

Requires `@astryxdesign/cli` (`npm install -D @astryxdesign/cli`):

```bash
npx astryx template --list              # browse all page and block templates
npx astryx template dashboard           # emit full page source
npx astryx template settings --skeleton # layout skeleton with spatial annotations
```

## XDS CLI

The CLI (`@astryxdesign/cli`) provides additional tooling:

```bash
npx astryx --help                       # full listing of all commands
npx astryx component Button             # full docs + related block templates
npx astryx docs                         # reference docs (principles, tokens, theming, styling)
npx astryx docs theme                   # theming guide (Theme, defineTheme, light/dark)
npx astryx docs tokens                  # spacing, color, radius, typography token reference
npx astryx init                         # initialize XDS in your project
npx astryx theme build                  # build theme CSS for production
npx astryx swizzle Button               # eject component source for customization
npx astryx upgrade --apply              # run codemods to migrate between versions
npx astryx discover                     # discover external XDS packages
npx astryx gap-report                   # report a missing capability
```

## Related Packages

| Package                                                                                               | Description                                                   |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [`@astryxdesign/cli`](https://github.com/facebook/astryx/tree/main/packages/cli)                      | CLI tooling: component docs, templates, scaffolding, codemods |
| [`@astryxdesign/theme-default`](https://github.com/facebook/astryx/tree/main/packages/themes/default) | Default theme (Heroicons)                                     |
| [`@astryxdesign/theme-neutral`](https://github.com/facebook/astryx/tree/main/packages/themes/neutral) | Muted, minimal theme (Lucide icons)                           |
| [`@astryxdesign/theme-daily`](https://github.com/facebook/astryx/tree/main/packages/themes/daily)     | Warm, productivity-focused theme (Lucide icons)               |

## Resources

- [Component Storybook](https://facebook.github.io/astryx/)
- [GitHub Repository](https://github.com/facebook/astryx)

---

## Quick Start

Install XDS and a theme:

```bash
npm install @astryxdesign/core @astryxdesign/theme-default
```

Then pick your setup below based on your framework and styling approach.

### Next.js + Tailwind (simplest)

No build plugins needed; XDS ships pre-built CSS that works alongside Tailwind.

**`src/app/globals.css`**

```css
@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;

@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/preflight.css' layer(base);
@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css';
@import '@astryxdesign/theme-default/theme.css';
@import '@astryxdesign/core/tailwind-theme.css';
@import 'tailwindcss/utilities.css' layer(utilities);
```

The `tailwind-theme.css` import maps system tokens to Tailwind utilities via `@theme inline`:

```tsx
// Without the bridge — verbose:
<div className="rounded-[var(--radius-container)] bg-[var(--color-background-surface)] text-[var(--color-text-primary)]">

// With the bridge — just works:
<div className="rounded-lg bg-surface text-primary">
```

Some useful mappings:

| Tailwind class                                            | XDS token                                         |
| --------------------------------------------------------- | ------------------------------------------------- |
| `text-primary` / `text-secondary`                         | `--color-text-primary` / `--color-text-secondary` |
| `bg-surface` / `bg-card` / `bg-body`                      | `--color-background-surface` / `card` / `body`    |
| `border-border` / `border-strong`                         | `--color-border` / `--color-border-emphasized`    |
| `bg-success` / `text-error` / `text-warning`              | Status tokens                                     |
| `bg-blue-subtle` / `border-blue-ring` / `text-blue-vivid` | Hue palette (×10 hues)                            |
| `rounded-sm` / `rounded-md` / `rounded-lg`                | `--radius-inner` / `element` / `container`        |
| `shadow-sm` / `shadow-md` / `shadow-lg`                   | `--shadow-low` / `med` / `high`                   |

Spacing references `var(--spacing-1)` as the base unit, so `p-4` = 16px, matching XDS's `--spacing-4`. Arbitrary values still work as an escape hatch: `bg-[var(--color-background-surface)]`.

**`src/app/providers.tsx`**

```tsx
'use client';

import Link from 'next/link';
import {Theme} from '@astryxdesign/core/theme';
import {LinkProvider} from '@astryxdesign/core/Link';
import {defaultTheme} from '@astryxdesign/theme-default/built';

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <Theme theme={defaultTheme}>
      <LinkProvider component={Link}>{children}</LinkProvider>
    </Theme>
  );
}
```

**`src/app/layout.tsx`**

```tsx
import './globals.css';
import {Providers} from './providers';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

That's it. Start using components:

```tsx
import {Button} from '@astryxdesign/core/Button';

export default function Page() {
  return <Button label="Hello XDS" variant="primary" />;
}
```

### Next.js + StyleX

Use the pre-built dist alongside StyleX for your own styles.

```bash
npm install @astryxdesign/core @astryxdesign/theme-default
```

**`src/app/globals.css`**

```css
@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css';
@import '@astryxdesign/theme-default/theme.css';
```

Providers and layout are the same as the Tailwind example (use `@astryxdesign/theme-default/built`).

### Vite

```bash
npm install @astryxdesign/core @astryxdesign/theme-default
```

Same CSS imports and providers as above. No build plugins needed; XDS ships pre-built.
