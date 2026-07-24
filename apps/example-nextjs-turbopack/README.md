# Astryx Example: Next.js 16 + Turbopack (Dist)

Reference application for consuming **@astryxdesign/core** as a pre-built dist
package in a **Next.js 16 app using Turbopack** (`next dev --turbopack` /
`next build --turbopack`).

Turbopack is the default bundler for Next.js 16. It resolves and links CSS
differently from webpack, so the CSS-import setup here differs from the
webpack-based examples ([example-nextjs](../example-nextjs/)).

## The one rule that matters: import library CSS from a module, not from CSS

**Do this** — import the stylesheets as JS side-effects in your root layout:

```tsx
// src/app/layout.tsx
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css';
import './globals.css';
```

**Not this** — `@import` of a package's CSS subpath from a CSS file:

```css
/* src/app/globals.css — DOES NOT LINK on Turbopack */
@import '@astryxdesign/core/astryx.css';
```

### Why

Turbopack builds its CSS graph from the **JS module graph**. CSS imported by a
module (layout/page/component) is bundled and a `<link>` is emitted for it.

A bare `@import` of a package's CSS subpath **from a CSS file** is compiled into
a chunk but is **not attached to the route** — the chunk exists in
`.next/static/chunks` but no `<link>` points at it, so none of the component
atomic rules reach the browser and Astryx components render **unstyled**. There
is no build error or console warning — it fails silently. Importing the CSS
from `layout.tsx` puts it on the module graph, where Turbopack links it
reliably.

This is a bundler behavior, not an Astryx bug, but the supported adoption path
on Turbopack is the module-import form above.

## Setup Steps

### 1. Install dependencies

```bash
npm install @astryxdesign/core @astryxdesign/theme-neutral next react react-dom
npm install --save-dev @types/react @types/react-dom typescript
```

### 2. Import CSS in the root layout (module side-effects)

See `src/app/layout.tsx`. Order matters:

1. `reset.css` — baseline resets (`@layer reset`)
2. `astryx.css` — all component styles (`@layer astryx-base`)
3. `theme.css` — theme token overrides (`@layer astryx-theme`)
4. `globals.css` — your app-level global CSS

### 3. Theme + Link provider (client boundary)

See `src/app/providers.tsx` — identical to the webpack example. `LinkProvider`
wires Next.js client-side navigation into Astryx link-based components.

## Gotchas

| Issue | Symptom | Fix |
| --- | --- | --- |
| `@import` of astryx.css from a CSS file | Components render unstyled; no error; CSS chunk exists but no `<link>` | Import the CSS from `layout.tsx` as a JS side-effect (see above) |
| Wrong CSS import order | Missing theme tokens or broken layers | Import reset → astryx → theme → globals in that order |
| No `'use client'` on provider | Server component error from `createContext` | Mark the provider file with `'use client'` |

## Running

```bash
pnpm install
pnpm --filter @astryxdesign/example-nextjs-turbopack dev    # next dev --turbopack
pnpm --filter @astryxdesign/example-nextjs-turbopack build  # next build --turbopack
```

## Related

- [Astryx + Next.js (webpack dist)](../example-nextjs/)
- [Astryx + Tailwind](../example-nextjs-tailwind/)
