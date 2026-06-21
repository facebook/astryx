---
'@xds/core': patch
'@xds/cli': patch
---

Fix built theme CSS regression introduced by the XDS-prefix migration (P2380608025) that broke Markdown typography in the docsite (headings lost their block margins).

Root cause: the generated compat-alias barrels self-re-export from `'.'`, and the Babel ESM build left that as a bare `from '.'` (a directory import Node ESM rejects). `xds theme build` could no longer import `@xds/core/theme`, so it silently fell back to its legacy CSS generator — which emitted bare `h1/p { margin: 0; ... }` prose defaults into `@layer xds-theme` (the highest XDS layer). Those out-ranked the Markdown component's own StyleX block-spacing (in `@layer xds-base`), collapsing heading/paragraph margins.

Fixes:

- The Babel extension plugin rewrites compat self-re-exports (`'.'` / `'..'`) to `./index.js` / `../index.js`, so `@xds/core/theme` imports cleanly and `xds theme build` stays on the shared generator.
- The CLI legacy fallback now mirrors the shared generator: prose defaults are zero-specificity `:where()` rules emitted into `@layer reset` (not `xds-theme`), with no `margin` resets — raw element margins stay owned by `reset.css` and the component StyleX, so Markdown's spacing wins.
- Prose paragraph defaults use `--font-family-body` (was `--font-family-heading`).
- Compat pseudo-class theme selectors now apply to both `astryx-*` and legacy `xds-*` classes.
