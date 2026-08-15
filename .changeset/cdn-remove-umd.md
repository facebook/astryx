---
'@astryxdesign/core': patch
---

[chore] Remove the UMD bundle — it could not work with any React this package supports (#5068).

`dist/astryx.umd.js` is no longer built or published, and with it go the `unpkg` and `jsdelivr`
package fields, the `./astryx.umd.js` export and the `build:umd` step.

Nobody has a migration to make, because there was no working configuration to migrate from. The
bundle binds Astryx to `window.React` and `window.ReactDOM`, and React 19 does not ship a build that
defines them: "UMD builds removed: To load React 19 with a script tag, we recommend using an
ESM-based CDN such as esm.sh." `https://unpkg.com/react@19.2.0/umd/react.production.min.js` is a 404
where 18.3.1 is a 200. Our `peerDependencies` are `react >= 19.0.0`, so every supported React is one
without a global for the bundle to bind to — it documented a path that never had an entrance.

If you were loading it with an older React anyway, load the same components as modules instead: an
import map for `react`, `react/jsx-runtime`, `react-dom`, `react-dom/client` and
`@astryxdesign/core` (pinned, with `?external=react,react-dom`), then one `<script type="module">`.
`astryx cdn template` writes that page for you, pinned to your installed version and annotated; the
recipe is also in the core README under "No build step (CDN)".

@cixzhang
