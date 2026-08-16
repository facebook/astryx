---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[feat] `astryx template --cdn` writes a working no-build-step CDN starter page (#5068).

A CDN starter is a template, so it joins the template family beside `--skeleton` rather than
claiming a top-level command. It is a flag and not the positional `astryx template cdn` because the
positional resolves against everything `discoverAll()` finds, where a `cdn` id would shadow a
discovered template. `cdn.template.html` loads Astryx from jsDelivr and esm.sh with no bundler, no
install and no build step, with every CDN URL pinned to the Astryx version you have installed — an
unpinned CDN URL resolves to whatever is latest and is cached hard, so a page written today breaks
tomorrow without being edited. An existing file is never clobbered; `--overwrite` replaces it, and
`--json` returns the receipt.

The annotations are the things that are load-bearing and silent when missing: `?external=react,react-dom`
(without it esm.sh bundles a second React and every hook throws `Cannot read properties of null
(reading 'useState')`), `react/jsx-runtime` in the import map (the published bundle imports it;
omitting it fails the page with `Failed to resolve module specifier`), and a `font-family` on `body`
(nothing in the stylesheets sets a document font, so `Button` — which is `font: inherit` — otherwise
renders its label in the browser's default serif).

Three more lessons came out of building a real app on it. The page now `<link>`s the theme's webfont
from Google Fonts, because the theme _names_ Figtree and never loads it, so every viewer silently
got the fallback stack (#5015 again). It imports the theme OBJECT and wraps in
`<Theme theme={neutralTheme} mode="system">`, so light and dark follow the OS — the
`data-astryx-theme` attribute alone scopes the stylesheet but cannot switch modes. And `#root:empty`
carries a "Loading…" state, because ESM-from-CDN has real latency and a blank page reads as broken.
Markup is `htm`, with a comment saying it is optional and `createElement` is the dependency-free
alternative.

A recipe that is only read is a recipe that is only assumed to work, so CI renders it:
`.github/scripts/cdn-template-smoke-test.mjs` scaffolds the page with the real CLI and opens it in
headless Chromium, failing on any console error, page error or failed request, and on a page that
loads without rendering.

@cixzhang
