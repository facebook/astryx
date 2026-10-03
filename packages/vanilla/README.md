# Vanilla Astryx

Experimental no-build Astryx assets for plain HTML pages. Vanilla Astryx combines readable `ax-*` classes, Astryx design tokens, and progressively enhanced browser behaviors in one CSS file and one JavaScript file.

## What is included

- Component CSS in `dist/astryx-vanilla.css`.
- Classic and ESM behavior bundles in `dist/astryx-vanilla.js` and `dist/astryx-vanilla.mjs`.
- Copyable component markup in `markup/`.
- Nine standalone page templates in `templates/`:
  - [`dashboard.html`](templates/dashboard.html)
  - [`table-filter.html`](templates/table-filter.html)
  - [`form-two-column.html`](templates/form-two-column.html)
  - [`detail-page.html`](templates/detail-page.html)
  - [`settings.html`](templates/settings.html)
  - [`shell-side-nav.html`](templates/shell-side-nav.html)
  - [`product-detail.html`](templates/product-detail.html)
  - [`login.html`](templates/login.html)
  - [`kanban-board.html`](templates/kanban-board.html)
- A browsable [`demo/index.html`](demo/index.html) with all seven shipped themes, a custom brand example, and light and dark modes.
- A committed, ready-to-open [`demo/pinned/index.html`](demo/pinned/index.html) and nine pinned templates.

The canonical templates use `__ASTRYX_VANILLA_CDN__` as the base for their CSS and JavaScript URLs. The Astryx CLI and the demo renderer replace that placeholder with the same commit-pinned jsDelivr URL.

## Try it

Install dependencies and build the package:

```sh
pnpm install --frozen-lockfile
pnpm -F @astryxdesign/vanilla build
pnpm -F @astryxdesign/vanilla test
```

A fresh clone already contains the rendered demo. Open `packages/vanilla/demo/pinned/index.html` directly in a browser; its links open the nine templates in the same directory. To regenerate the pinned copies from the canonical demo, templates, and CDN pin, run:

```sh
pnpm -F @astryxdesign/vanilla demo
```

The command prints the ready-to-open `file://` URL. The committed copies intentionally load CSS and JavaScript from the single `ASTRYX_VANILLA_CDN_REF` constant in the CLI.

Run the CLI directly from a checkout:

```sh
node packages/cli/clients/cli/bin/astryx.mjs template --list --html
node packages/cli/clients/cli/bin/astryx.mjs template dashboard --html > dashboard.html
```

For local development, replace `__ASTRYX_VANILLA_CDN__` in a canonical template or the source demo index with either:

- `../dist` for the source demo index;
- an absolute URL for a local static server; or
- a commit-pinned public URL such as `https://cdn.jsdelivr.net/gh/facebook/astryx@<commit>/packages/vanilla/dist`.

Then serve the repository root with any static file server. The canonical HTML documents preserve the placeholder for CLI rendering, while `demo/pinned/` is the zero-setup copy for local files or an HTML-capable static host.

## Markup contract

- Public markup uses readable BEM-style `ax-*` classes such as `.ax-button`, `.ax-button--primary`, and `.ax-card__header`.
- State uses native elements and ARIA attributes where possible; behavior hooks use `data-ax-*` attributes.
- Component styles live one-per-file in `src/components/` and are discovered automatically by the build.
- `markup/<ComponentName>.html` contains CLI-ready examples beginning with a `docs` comment and labeled `variant` blocks.
- CSS custom-property defaults are generated from `packages/core/src/theme/tokens.stylex.ts`.
- The document root selects a shipped or custom theme with `data-astryx-theme` and selects `light` or `dark` with `data-theme`.

## Theming

Vanilla Astryx supports Neutral, Butter, Y2K, Stone, Matcha, Chocolate, and Gothic. Load the corresponding `@astryxdesign/theme-*` stylesheets, then switch themes by changing `data-astryx-theme` on the document root. Gothic is intentionally dark-only.

The JavaScript bundle persists controls marked with `data-ax-theme-switch`, `data-ax-mode-switch`, `data-ax-theme-toggle`, or `data-ax-mode-toggle`. The demo and templates restore the saved choice before styles load, and template query parameters named `theme` and `mode` take precedence.

Custom themes override semantic CSS variables in the `astryx-theme` layer. The included purple brand example changes the accent used by Button, Badge, and Link plus the page wash without restyling component classes.

See [`docs/theming.md`](docs/theming.md) for the complete stylesheet, font, switcher, persistence, and custom-theme examples. Copy the switcher and brand variants from the CLI with:

```sh
node packages/cli/clients/cli/bin/astryx.mjs component Selector --html
```

## Known gaps

This is a proof of concept optimized for demo clarity, not a production compatibility promise. It covers the documented component subset and modern browser primitives; it does not yet provide every React Astryx component, server-rendered state, framework adapters, or a legacy-browser bundle. Shipped theme packages override shared tokens, while theme rules aimed at React's generated component classes do not automatically style `ax-*` components.

A future implementation could generate readable vanilla CSS and component markup from the same source used by React Astryx. That would remove parallel styling work while preserving a no-build consumer path.
