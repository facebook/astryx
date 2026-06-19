# @xds/core

Core UI components, theme system, and utilities for the XDS design system. For project setup, see [Quick Start](#quick-start) below.

## Component Docs

Look up any component's full API (props, types, best practices, and theming):

```bash
node node_modules/@xds/core/docs.mjs Button        # full docs for a component
node node_modules/@xds/core/docs.mjs --list         # list all components
node node_modules/@xds/core/docs.mjs --list --brief  # brief summaries
```

## Page Layouts

Building a full page? Start with a template rather than composing from scratch.
Templates are content-only; they compose `XDSLayout` with header, content, and
panel slots into common page patterns (dashboards, settings, forms, detail pages).
Wrap them in your own app chrome (`XDSAppShell`, `XDSTopNav`, `XDSSideNav`) to add
global navigation.

Requires `@xds/cli` (`npm install -D @xds/cli`):

```bash
npx xds template --list              # browse all page and block templates
npx xds template dashboard           # emit full page source
npx xds template settings --skeleton # layout skeleton with spatial annotations
```

## XDS CLI

The CLI (`@xds/cli`) provides additional tooling:

```bash
npx xds --help                       # full listing of all commands
npx xds component Button             # full docs + related block templates
npx xds docs                         # reference docs (principles, tokens, theming, styling)
npx xds docs theme                   # theming guide (XDSTheme, defineTheme, light/dark)
npx xds docs tokens                  # spacing, color, radius, typography token reference
npx xds init                         # initialize XDS in your project
npx xds theme build                  # build theme CSS for production
npx xds swizzle Button               # eject component source for customization
npx xds upgrade --apply              # run codemods to migrate between versions
npx xds discover                     # discover external XDS packages
npx xds gap-report                   # report a missing capability
```

## Related Packages

| Package                                                                                               | Description                                                   |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [`@xds/cli`](https://github.com/facebookexperimental/xds/tree/main/packages/cli)                      | CLI tooling: component docs, templates, scaffolding, codemods |
| [`@xds/theme-default`](https://github.com/facebookexperimental/xds/tree/main/packages/themes/default) | Default theme (Heroicons)                                     |
| [`@xds/theme-neutral`](https://github.com/facebookexperimental/xds/tree/main/packages/themes/neutral) | Muted, minimal theme (Lucide icons)                           |
| [`@xds/theme-daily`](https://github.com/facebookexperimental/xds/tree/main/packages/themes/daily)     | Warm, productivity-focused theme (Lucide icons)               |

## Resources

- [Component Storybook](https://facebookexperimental.github.io/xds/)
- [GitHub Repository](https://github.com/facebookexperimental/xds)

---

## Quick Start

Install XDS and a theme:

```bash
npm install @xds/core @xds/theme-default
```

Then pick your setup below based on your framework and styling approach.

### Next.js + Tailwind (simplest)

No build plugins needed; XDS ships pre-built CSS that works alongside Tailwind.

**`src/app/globals.css`**

```css
@layer reset, theme, base, xds-base, xds-theme, components, utilities;

@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/preflight.css' layer(base);
@import '@xds/core/reset.css';
@import '@xds/core/xds.css';
@import '@xds/theme-default/theme.css';
@import '@xds/core/tailwind-theme.css';
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
import {XDSTheme} from '@xds/core/theme';
import {XDSLinkProvider} from '@xds/core/Link';
import {defaultTheme} from '@xds/theme-default/built';

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <XDSTheme theme={defaultTheme}>
      <XDSLinkProvider component={Link}>{children}</XDSLinkProvider>
    </XDSTheme>
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
import {XDSButton} from '@xds/core/Button';

export default function Page() {
  return <XDSButton label="Hello XDS" variant="primary" />;
}
```

### Next.js + StyleX

Use the pre-built dist alongside StyleX for your own styles.

```bash
npm install @xds/core @xds/theme-default
```

**`src/app/globals.css`**

```css
@import '@xds/core/reset.css';
@import '@xds/core/xds.css';
@import '@xds/theme-default/theme.css';
```

Providers and layout are the same as the Tailwind example (use `@xds/theme-default/built`).

### Vite

```bash
npm install @xds/core @xds/theme-default
```

Same CSS imports and providers as above. No build plugins needed; XDS ships pre-built.
