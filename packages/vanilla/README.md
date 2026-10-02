# Vanilla Astryx

Experimental no-build Astryx assets for plain HTML pages. Vanilla Astryx combines readable `ax-*` classes, Astryx design tokens, and progressively enhanced browser behaviors in one CSS file and one JavaScript file.

## What is included

- Component CSS in `dist/astryx-vanilla.css`.
- Classic and ESM behavior bundles in `dist/astryx-vanilla.js` and `dist/astryx-vanilla.mjs`.
- Copyable component markup in `markup/`.
- Four standalone page templates in `templates/`:
  - [`dashboard.html`](templates/dashboard.html)
  - [`table-filter.html`](templates/table-filter.html)
  - [`form-two-column.html`](templates/form-two-column.html)
  - [`detail-page.html`](templates/detail-page.html)
- A browsable [`demo/index.html`](demo/index.html) with neutral, butter, and Y2K theme controls plus light and dark modes.

The templates use `__ASTRYX_VANILLA_CDN__` as the base for their CSS and JavaScript URLs. The Astryx CLI replaces that placeholder with a commit-pinned jsDelivr URL when it emits HTML.

## Try it

Install dependencies and build the package:

```sh
pnpm install --frozen-lockfile
pnpm -F @astryxdesign/vanilla build
pnpm -F @astryxdesign/vanilla test
```

Run the CLI directly from a checkout:

```sh
node packages/cli/clients/cli/bin/astryx.mjs template --list --html
node packages/cli/clients/cli/bin/astryx.mjs template dashboard --html > dashboard.html
```

For local development, replace `__ASTRYX_VANILLA_CDN__` in a template or the demo index with either:

- `../dist` for the committed demo index;
- an absolute URL for a local static server; or
- a commit-pinned public URL such as `https://cdn.jsdelivr.net/gh/facebook/astryx@<commit>/packages/vanilla/dist`.

Then serve the repository root with any static file server. The HTML documents themselves are intended for a local file or static host because jsDelivr serves HTML as plain text.

## Markup contract

- Public markup uses readable BEM-style `ax-*` classes such as `.ax-button`, `.ax-button--primary`, and `.ax-card__header`.
- State uses native elements and ARIA attributes where possible; behavior hooks use `data-ax-*` attributes.
- Component styles live one-per-file in `src/components/` and are discovered automatically by the build.
- `markup/<ComponentName>.html` contains CLI-ready examples beginning with a `docs` comment and labeled `variant` blocks.
- CSS custom-property defaults are generated from `packages/core/src/theme/tokens.stylex.ts`.
- The document root selects appearance with `data-astryx-theme="neutral|butter|y2k"` and `data-theme="light|dark"`.

## Known gaps

This is a proof of concept optimized for demo clarity, not a production compatibility promise. It covers the documented component subset and modern browser primitives; it does not yet provide every React Astryx component, server-rendered state, framework adapters, or a legacy-browser bundle. Shipped theme packages override shared tokens, while theme rules aimed at React's generated component classes do not automatically style `ax-*` components.

A future implementation could generate readable vanilla CSS and component markup from the same source used by React Astryx. That would remove parallel styling work while preserving a no-build consumer path.
