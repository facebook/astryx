---
'@xds/core': patch
'@xds/cli': patch
---

Fix built theme CSS regression introduced by the XDS-prefix migration that broke Markdown typography in the docsite (headings lost their block margins).

Root cause: the generated compat-alias barrels self-re-export from `'.'`, and the Babel ESM build left that as a bare `from '.'` (a directory import Node ESM rejects). `xds theme build` could no longer import `@xds/core/theme` and silently fell back to a duplicated, in-CLI CSS generator — which emitted bare `h1/p { margin: 0; ... }` prose defaults into `@layer xds-theme` (the highest XDS layer). Those out-ranked the Markdown component's own StyleX block-spacing (in `@layer xds-base`), collapsing heading/paragraph margins.

Fixes:

- The Babel extension plugin rewrites compat self-re-exports (`'.'` / `'..'`) to `./index.js` / `../index.js`, so `@xds/core/theme` imports cleanly.
- `xds theme build` now has a single CSS generation path — `@xds/core`'s generator, the same one the `<Theme>` runtime uses. The duplicated in-CLI generator (`generateCSS` / `generateProseCSS` / local `parseStyleKey` / `expandContainerPadding`) is removed, and a failed `@xds/core/theme` import is now a hard build error (`ERR_CORE_NOT_FOUND`) instead of a silent fallback. This guarantees the CLI and runtime can never emit divergent CSS.
- The `theme build --no-prose` flag is removed. The runtime always emits prose element defaults, so allowing the build to omit them was another way for the CLI output to diverge from runtime. Prose defaults now always ship, in `@layer reset`.
- Prose paragraph defaults use `--font-family-body` (was `--font-family-heading`).
- Theme component pseudo-class selectors now apply to both `astryx-*` and legacy `xds-*` classes.
