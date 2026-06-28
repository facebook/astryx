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
| [`@astryxdesign/theme-neutral`](https://github.com/facebook/astryx/tree/main/packages/themes/neutral) | Muted, minimal theme (Lucide icons)                           |

## Resources

- [Component Storybook](https://facebook.github.io/astryx/)
- [GitHub Repository](https://github.com/facebook/astryx)

---

## Quick Start

Install XDS and a theme:

```bash
npm install @astryxdesign/core @astryxdesign/theme-neutral
```

Then pick your setup below based on your framework and styling approach.

### Next.js (simplest)

The fastest way to get started. No build plugins, no PostCSS, no Babel config — Astryx ships pre-built CSS and JS, so you import three stylesheets (order matters) and wrap your app in a theme provider.

**`src/app/globals.css`**

```css
@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css';
@import '@astryxdesign/theme-neutral/theme.css';
```

The import order maps to the layer cascade: `reset.css` (`@layer reset`) → `astryx.css` component styles (`@layer astryx-base`) → `theme.css` token overrides (`@layer astryx-theme`).

**`src/app/providers.tsx`**

```tsx
'use client';

import Link from 'next/link';
import {Theme} from '@astryxdesign/core/theme';
import {LinkProvider} from '@astryxdesign/core/Link';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <Theme theme={neutralTheme}>
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

### Next.js + Tailwind

No build plugins needed; XDS ships pre-built CSS that works alongside Tailwind.

**`src/app/globals.css`**

```css
@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;

@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/preflight.css' layer(base);
@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css';
@import '@astryxdesign/theme-neutral/theme.css';
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
import {neutralTheme} from '@astryxdesign/theme-neutral/built';

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <Theme theme={neutralTheme}>
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
npm install @astryxdesign/core @astryxdesign/theme-neutral
```

**`src/app/globals.css`**

```css
@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css';
@import '@astryxdesign/theme-neutral/theme.css';
```

Providers and layout are the same as the Tailwind example (use `@astryxdesign/theme-neutral/built`).

### Vite

```bash
npm install @astryxdesign/core @astryxdesign/theme-neutral
```

Same CSS imports and providers as above. No build plugins needed; XDS ships pre-built.

### No build step (CDN)

For prototypes, embeds, or pages without a bundler, load the components straight
from a public CDN. Two delivery options ship in the published package:

**1. UMD global (`<script>` tag).** A single pre-bundled file exposes every export
on `window.Astryx`. React and ReactDOM are peer dependencies — load them yourself.
Pair it with the precompiled stylesheet.

```html
<!doctype html>
<html data-astryx-theme="neutral">
  <head>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@astryxdesign/core/src/reset.css" />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@astryxdesign/core/dist/astryx.css" />
  </head>
  <body>
    <div id="root"></div>
    <script
      crossorigin
      src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
    <script
      crossorigin
      src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@astryxdesign/core/dist/astryx.umd.js"></script>
    <script>
      const {Button, Card} = window.Astryx;
      const e = React.createElement;
      ReactDOM.createRoot(document.getElementById('root')).render(
        e(Card, null, e(Button, {variant: 'primary'}, 'Hello from a CDN')),
      );
    </script>
  </body>
</html>
```

**2. ES modules (no UMD, no globals).** Use [esm.sh](https://esm.sh), which rewrites
bare imports to browser-resolvable URLs. An import map keeps a single React instance.

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@astryxdesign/core/dist/astryx.css" />
<script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@19",
      "react-dom/client": "https://esm.sh/react-dom@19/client",
      "@astryxdesign/core": "https://esm.sh/@astryxdesign/core?external=react,react-dom"
    }
  }
</script>
<script type="module">
  import {createRoot} from 'react-dom/client';
  import {Button} from '@astryxdesign/core';
  // ...render as usual
</script>
```

> Pin a version in production (e.g. `@astryxdesign/core@0.1.1`) — unversioned CDN URLs
> resolve to the latest release and are cached aggressively. The raw ESM entry
> (`dist/index.js`) uses bare `react` imports and will **not** run from a plain
> `<script src>`; use the UMD global or esm.sh as shown above.
