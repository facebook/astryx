# Vanilla Astryx

Experimental no-build Astryx assets for the `poc/vanilla-astryx` branch.

## Contract

- Public markup uses readable BEM-style `ax-*` classes such as `.ax-button`, `.ax-button--primary`, and `.ax-card__header`.
- Component styles live one-per-file in `src/components/` and are discovered automatically by the build.
- `markup/<ComponentName>.html` contains CLI-ready examples beginning with a `docs` comment and labeled `variant` blocks.
- CSS custom-property defaults are generated from `packages/core/src/theme/tokens.stylex.ts`.
- `dist/astryx-vanilla.js` is a classic script; `dist/astryx-vanilla.mjs` exports the same theme and mode helpers as ESM.

## Build and test

```sh
pnpm -F @astryxdesign/vanilla build
pnpm -F @astryxdesign/vanilla test
pnpm -F @astryxdesign/vanilla check
```

Open `examples/proof.html` through a local static server after replacing `__CDN_REF__` with a commit SHA, or rewrite the asset links to local `dist/` files while developing.

Shipped neutral, butter, and y2k theme stylesheets still provide token overrides through `data-astryx-theme`; their `.astryx-*` component overrides do not automatically apply to `ax-*`. T1 carries small scoped mappings for Button, Card, and TextInput only.
