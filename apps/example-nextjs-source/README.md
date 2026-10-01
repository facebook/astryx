# Astryx Example: Next.js (Migrated Source Build)

This standalone app shows how to move a product that authored StyleX away from compiling Astryx package source. The directory name is retained for migration history; the app now consumes published, precompiled Astryx packages.

## Architecture

- Next.js 16 uses Turbopack through ordinary `next dev` and `next build` commands.
- Astryx loads `reset.css`, `astryx.css`, and the selected theme CSS from published packages.
- The official StyleX Babel + PostCSS path compiles only `src/app/**/*.{js,jsx,ts,tsx}`.
- Product classes use the `p` prefix and product layers follow `reset → astryx-base → astryx-theme`.
- `next.config.mjs` has no `withAstryx`, `transpilePackages`, webpack hook, or source alias.
- `pnpm check:stylex` fails on workspace-linked Astryx, source-scan leaks, duplicated rules, `x` classes in product layers, oversized CSS, or incorrect layer order.

The previous source build was webpack-only and depended on `@astryxdesign/build`. Turbopack has no equivalent plugin API, so compiling Astryx source would mix unsupported bundler behavior with product compilation. Precompiled Astryx CSS keeps package internals outside the product compiler while preserving the same cascade contract.

## Run

```bash
pnpm install
pnpm dev
```

The home and `/details` routes are React Server Components that compose client components owning product StyleX. CI builds both routes, checks the generated CSS boundary, exercises StyleX HMR add/change/remove, and captures desktop/mobile light/dark Chromium evidence.

## Known limitation

StyleX's official PostCSS integration emits one app-wide sheet from every file matched by `include`; it does not provide route-level or import-graph CSS tree shaking. Keep the product include narrow and consume Astryx only through its published JavaScript and CSS.
