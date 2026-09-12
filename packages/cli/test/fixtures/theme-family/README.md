# Theme family artifact example

This fixture is both executable coverage and a small reference for publishing a
base theme with related descendants.

```sh
pnpm exec astryx theme build \
  --family ./ocean.mjs ./ocean-deep.mjs ./ocean-midnight.mjs ./ocean-calm.mjs \
  --family-key ocean-family
```

The command publishes one current generation containing:

- `ocean-family.css` — load once with a normal `<link>`; it contains every member.
- `ocean-family.js` — CSS-free ESM with one complete export per member.
- `ocean-family.d.ts` — declarations for the same exports and custom values.
- `ocean-family.manifest.json` plus build/member receipts — generation ownership and verification data, not runtime assembly instructions.

Open `index.html` through an HTTP server after building. It demonstrates sibling
and nested roots, a zero-delta member, and attribute-only switching. The complete
family downloads eagerly in one CSS request; use a standalone build when an app
needs only one complete theme.
