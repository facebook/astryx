# XDS Example — Next.js (Dist)

Reference application for consuming **@xds/core** as a pre-built dist package in a Next.js project.

No StyleX build plugin needed — XDS ships pre-compiled CSS and JS. This is the simplest way to get started.

## Setup Steps

### 1. Install dependencies

```bash
npm install @xds/core @xds/theme-default next react react-dom
npm install --save-dev @types/react @types/react-dom typescript
```

### 2. Browserslist

Add a `browserslist` to `package.json` so that Next.js (and its internal lightningcss) targets modern browsers. Without this, lightningcss may lower `light-dark()` into polyfill variables that break XDS theming:

```json
{
  "browserslist": ["last 1 Chrome version"]
}
```

> For internal tools targeting latest Chrome, `"last 1 Chrome version"` is sufficient. For broader browser support, use targets that include Chrome 123+ / Firefox 120+ / Safari 17.5+ (when `light-dark()` shipped).

### 3. CSS imports

`src/app/globals.css` — import the reset, component styles, and theme:

```css
@import '@xds/core/reset.css';
@import '@xds/core/xds.css';
@import '@xds/theme-default/theme.css';
```

The CSS import order matters:

1. `reset.css` — baseline resets (`@layer reset`)
2. `xds.css` — all component styles (`@layer xds`)
3. `theme.css` — theme token overrides (`@layer xds.theme`)

Import the CSS file in your root layout:

```tsx
import './globals.css';
```

### 4. Theme + Link provider (client boundary)

```tsx
// src/app/providers.tsx
'use client';
import Link from 'next/link';
import {XDSTheme} from '@xds/core/theme';
import {XDSLinkProvider} from '@xds/core/Link';
import {defaultTheme} from '@xds/theme-default/built';

export function Providers({children}) {
  return (
    <XDSTheme theme={defaultTheme}>
      <XDSLinkProvider component={Link}>{children}</XDSLinkProvider>
    </XDSTheme>
  );
}
```

`XDSLinkProvider` wires up Next.js client-side navigation for all XDS link-based components (Link, Button with href, TopNav, SideNav, Breadcrumbs, TabList).

## Gotchas

| Issue                         | Symptom                                     | Fix                                                               |
| ----------------------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| Missing `browserslist`        | Colors broken — `light-dark()` gets lowered | Add `"browserslist": ["last 1 Chrome version"]` to `package.json` |
| Wrong CSS import order        | Missing theme tokens or broken layers       | Import reset → xds → theme in that order                          |
| No `'use client'` on provider | Server component error from `createContext` | Mark the provider file with `'use client'`                        |

## Testing outside the monorepo

This example lives in the XDS monorepo for convenience, but it should be representative of a real app consuming `@xds/core` from npm. Monorepo workspace resolution can silently bypass issues that external consumers hit.

**Before merging changes to this example, test it as an external consumer** — see the [Testing Example Apps](https://github.com/facebookexperimental/xds/wiki/Testing-Example-Apps) wiki page for the full procedure.

## Related

- [Issue #145 — Add example-nextjs project](https://github.com/facebookexperimental/xds/issues/145)
- [XDS + Tailwind example](../example-nextjs-tailwind/) — same dist approach with Tailwind for custom layout styles
