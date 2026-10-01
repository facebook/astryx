# Astryx Example: Next.js + StyleX

Reference application for Next.js 16 with Turbopack, precompiled Astryx CSS, and StyleX for product-owned source.

## Architecture

Astryx stays outside the app compiler:

```css
@import './layers.css'; /* reset, astryx-base, astryx-theme, product */
@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css';
@import '@astryxdesign/theme-neutral/theme.css';

@stylex;
```

- `reset.css`, `astryx.css`, and `theme.css` are public, precompiled package outputs.
- `layers.css` is imported first so the four cascade bands are declared before any rules.
- Babel transforms app files only; Turbopack keeps published `node_modules` packages foreign.
- PostCSS scans only `src/app/**/*.{js,jsx,ts,tsx}` and explicitly excludes all `node_modules` plus this repository's `packages/` tree.
- Product classes use the `p` prefix. Product CSS layers use the `product.*` namespace.
- `pnpm check:stylex` fails if Astryx resolves through a workspace symlink, Astryx rules leak into product layers, CSS is duplicated, or layer order changes.

This is the [official StyleX Babel + PostCSS path for Next.js](https://stylexjs.com/docs/learn/installation/nextjs). It works with both Turbopack and webpack beginning in Next.js 16.0.3. This example uses ordinary `next dev` and `next build`, so Next.js 16 selects Turbopack without a custom webpack hook.

## Install and run

```bash
pnpm install
pnpm dev
```

The home and `/details` route files remain React Server Components. Each composes a client component that owns product StyleX, matching the official integration's client-side transform boundary while keeping routing and data work on the server.

## CSS output limitation

The official PostCSS integration scans every file matched by `include` and replaces the single `@stylex` directive with one app-wide StyleX sheet. It does **not** promise route-level CSS splitting or import-graph tree shaking: a matching file can contribute CSS even when no route imports it. Keep `include` narrow and do not describe this output as per-route or tree-shaken.

Astryx CSS is intentionally complete rather than component-tree-shaken. Import each Astryx stylesheet once; never add Astryx package source to either compiler scan.
