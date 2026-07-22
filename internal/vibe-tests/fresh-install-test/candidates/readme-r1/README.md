# @astryxdesign/core

Core UI components, theme system, and utilities for the Astryx design system.

> **Setup is one command: `npx astryx init`.** It installs the Astryx component
> cheat sheet into your `AGENTS.md` / `CLAUDE.md` (so AI coding agents build with
> real components instead of guessing) and walks you through wiring styles +
> providers. **Run it first** — see [Setup](#setup).

## Setup

Two steps to a working Astryx app.

**1. Install the package and a theme:**

```bash
npm install @astryxdesign/core @astryxdesign/theme-neutral
```

**2. Initialize with the CLI — do this first:**

```bash
npx astryx init
```

`npx astryx init` is the recommended, canonical way to set up Astryx. It:

- **installs the Astryx component cheat sheet into your `AGENTS.md` / `CLAUDE.md`** —
  this is what makes an AI coding agent (Cursor, Claude Code, Copilot, …) aware of
  Astryx, so it discovers the real components, page templates, and design tokens
  instead of guessing at APIs;
- optionally scaffolds a custom **theme** and a starter **page template**;
- prints the exact base-style imports and theme/link **provider** setup you need to
  finish wiring your app.

The rest of this guide assumes `init` has run.

> **Building with an AI agent?** `npx astryx init` is the single most important
> step — it's what gives the agent the component index. Skipping it is the
> difference between the agent building real Astryx UI and hallucinating props.
> Run it first.

**Non-interactive (CI, scripts, AI agents).** Plain `npx astryx init` is an
interactive wizard and needs a TTY. To run it unattended, pass features explicitly:

```bash
npx astryx init --features agents   # install the AI-agent cheat sheet only, no prompts
npx astryx init --all               # install all features, no prompts
```

> `astryx` is the Astryx CLI (`@astryxdesign/cli`); `npx` fetches it on demand. To
> keep it local, `npm install -D @astryxdesign/cli`.

**Finish wiring.** `init` prints the two remaining steps for your framework — add
the base-style imports and wrap your app in the `<Theme>` (and `<LinkProvider>`)
providers. The exact per-framework code lives in
[Manual setup](#manual-setup-advanced) below; copy it from there if you'd rather
not read it off the CLI output. Then use any component:

```tsx
import {Button} from '@astryxdesign/core/Button';

export default function Page() {
  return <Button label="Hello Astryx" variant="primary" />;
}
```

## Component Docs

Look up any component's full API (props, types, best practices, and theming). This
reads straight from the installed package, so it works without the CLI:

```bash
node node_modules/@astryxdesign/core/docs.mjs Button          # full docs for a component
node node_modules/@astryxdesign/core/docs.mjs --list          # list all components
node node_modules/@astryxdesign/core/docs.mjs --list --brief  # brief summaries
```

## Astryx CLI

After [`npx astryx init`](#setup), the CLI (`@astryxdesign/cli`) powers the rest of
the workflow — component docs, page templates, theming, and codemods:

```bash
npx astryx init                         # ← start here: setup + AI agent cheat sheet
npx astryx --help                       # full listing of all commands
npx astryx component Button             # full docs + related block templates
npx astryx docs                         # reference docs (principles, tokens, theming, styling)
npx astryx docs theme                   # theming guide (Theme, defineTheme, light/dark)
npx astryx docs tokens                  # spacing, color, radius, typography token reference
npx astryx theme build                  # build theme CSS for production
npx astryx swizzle Button               # eject component source for customization
npx astryx upgrade --apply              # run codemods to migrate between versions
npx astryx discover                     # discover external Astryx packages
npx astryx gap-report                   # report a missing capability
```

## Page Layouts

Building a full page? Start with a template rather than composing from scratch (run
`npx astryx init` first). Templates are content-only; they compose `Layout` with
header, content, and panel slots into common page patterns (dashboards, settings,
forms, detail pages). Wrap them in your own app chrome (`AppShell`, `TopNav`,
`SideNav`) to add global navigation.

```bash
npx astryx template --list              # browse all page and block templates
npx astryx template dashboard           # emit full page source
npx astryx template settings --skeleton # layout skeleton with spatial annotations
```

## Manual setup (advanced)

_Per-framework CSS + provider wiring, for when you're not using the CLI._
**`npx astryx init` does everything in this section for you and also installs the
AI-agent cheat sheet** (hand-wiring does not) — so prefer it. Reach for this section
only if you can't run the CLI, or you want to see the exact code `init` prints.

Whatever your framework, install the package and a theme first:

```bash
npm install @astryxdesign/core @astryxdesign/theme-neutral
```

Astryx ships pre-built CSS and JS — no build plugins, PostCSS, or Babel config
required. You import the stylesheets (order matters) and wrap your app in a theme
provider.

<details>
<summary><strong>Next.js</strong> (simplest)</summary>

**`src/app/globals.css`**

```css
@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css';
@import '@astryxdesign/theme-neutral/theme.css';
```

The import order maps to the layer cascade: `reset.css` (`@layer reset`) →
`astryx.css` component styles (`@layer astryx-base`) → `theme.css` token overrides
(`@layer astryx-theme`).

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

</details>

<details>
<summary><strong>Next.js + Tailwind</strong></summary>

No build plugins needed; Astryx ships pre-built CSS that works alongside Tailwind.

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

The `tailwind-theme.css` import maps system tokens to Tailwind utilities via
`@theme inline`:

```tsx
// Without the bridge — verbose:
<div className="rounded-[var(--radius-container)] bg-[var(--color-background-surface)] text-[var(--color-text-primary)]">

// With the bridge — just works:
<div className="rounded-lg bg-surface text-primary">
```

Some useful mappings:

| Tailwind class                                            | Astryx token                                      |
| --------------------------------------------------------- | ------------------------------------------------- |
| `text-primary` / `text-secondary`                         | `--color-text-primary` / `--color-text-secondary` |
| `bg-surface` / `bg-card` / `bg-body`                      | `--color-background-surface` / `card` / `body`    |
| `border-border` / `border-strong`                         | `--color-border` / `--color-border-emphasized`    |
| `bg-success` / `text-error` / `text-warning`              | Status tokens                                     |
| `bg-blue-subtle` / `border-blue-ring` / `text-blue-vivid` | Hue palette (×10 hues)                            |
| `rounded-sm` / `rounded-md` / `rounded-lg`                | `--radius-inner` / `element` / `container`        |
| `shadow-sm` / `shadow-md` / `shadow-lg`                   | `--shadow-low` / `med` / `high`                   |

Spacing references `var(--spacing-1)` as the base unit, so `p-4` = 16px, matching
Astryx's `--spacing-4`. Arbitrary values still work as an escape hatch:
`bg-[var(--color-background-surface)]`.

Providers and layout are identical to the plain **Next.js** example above.

</details>

<details>
<summary><strong>Next.js + StyleX</strong></summary>

Use the pre-built dist alongside StyleX for your own styles.

**`src/app/globals.css`**

```css
@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css';
@import '@astryxdesign/theme-neutral/theme.css';
```

Providers and layout are the same as the plain **Next.js** example (use
`@astryxdesign/theme-neutral/built`).

</details>

<details>
<summary><strong>Vite</strong></summary>

Same CSS imports and providers as the **Next.js** example. No build plugins needed;
Astryx ships pre-built.

</details>

Once wired, start using components:

```tsx
import {Button} from '@astryxdesign/core/Button';

export default function Page() {
  return <Button label="Hello Astryx" variant="primary" />;
}
```

> Rather not manage any of this by hand? **`npx astryx init`** sets it up for you
> and makes your AI agent Astryx-aware — see [Setup](#setup).

## CDN (no build step)

For prototypes, embeds, or pages without a bundler, load the components straight
from a public CDN. Two delivery options ship in the published package. (The CLI and
its AI-agent cheat sheet aren't available on this path — use `npx astryx init` in a
real project.)

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

## Related Packages

| Package                                                                                               | Description                                                   |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [`@astryxdesign/cli`](https://github.com/facebook/astryx/tree/main/packages/cli)                      | CLI tooling: component docs, templates, scaffolding, codemods |
| [`@astryxdesign/theme-neutral`](https://github.com/facebook/astryx/tree/main/packages/themes/neutral) | Muted, minimal theme (Lucide icons)                           |

## Resources

- [Component Storybook](https://facebook.github.io/astryx/)
- [GitHub Repository](https://github.com/facebook/astryx)
