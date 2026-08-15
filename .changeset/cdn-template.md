---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[feat] `astryx cdn template` writes a working no-build-step CDN starter page (#5068).

New sibling of `theme template`: an annotated file that is a doc which happens to run. `cdn.template.html` loads Astryx from jsDelivr and esm.sh with no bundler, no install and no build step, with every CDN URL pinned to the Astryx version you have installed — an unpinned CDN URL resolves to whatever is latest and is cached hard, so a page written today breaks tomorrow without being edited. An existing file is never clobbered; `--overwrite` replaces it, and `--json` returns the receipt.

The annotations are the four things that are load-bearing and silent when missing: `data-astryx-theme` on `<html>` (theme CSS is scoped to it), `?external=react,react-dom` (without it esm.sh bundles a second React and every hook throws `Cannot read properties of null (reading 'useState')`), `react/jsx-runtime` in the import map (the published bundle imports it; omitting it fails the page with `Failed to resolve module specifier`), and a `font-family` on `body` (nothing in the stylesheets sets a document font, so `Button` — which is `font: inherit` — otherwise renders its label in the browser's default serif).

A recipe that is only read is a recipe that is only assumed to work, so CI renders it: `.github/scripts/cdn-template-smoke-test.mjs` scaffolds the page with the real CLI and opens it in headless Chromium, failing on any console error, page error or failed request, and on a page that loads without rendering.

@cixzhang
