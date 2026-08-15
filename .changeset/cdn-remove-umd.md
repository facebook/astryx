---
'@astryxdesign/core': minor
---

[breaking] Remove the UMD bundle — the CDN path is ES modules now.

`dist/astryx.umd.js` is no longer built or published, and with it go the `unpkg` and `jsdelivr` package fields, the `./astryx.umd.js` export and the `build:umd` step. There is no `window.Astryx` global any more.

The bundle bound Astryx to `window.React` and `window.ReactDOM`, which React 19 stopped shipping: "UMD builds removed: To load React 19 with a script tag, we recommend using an ESM-based CDN such as esm.sh." `https://unpkg.com/react@19.2.0/umd/react.production.min.js` is a 404 (18.3.1 is a 200), so a page following the old recipe on React 19 could not get a React to bind to. It documented a path that no longer had an entrance.

Migration: drop the three `<script src>` tags and load the same components as modules — an import map for `react`, `react/jsx-runtime`, `react-dom`, `react-dom/client` and `@astryxdesign/core` (pinned, with `?external=react,react-dom`), then a single `<script type="module">`. `astryx cdn template` writes the whole page, pinned to your installed version and annotated; the recipe is also in the core README under "No build step (CDN)".

@cixzhang
