---
'@astryxdesign/build': patch
---

[fix] build: import `node:fs` statically so the Vite plugin's package discovery survives the ESM build (#4972)

`astryxStylex()`'s config plugin discovered installed `@astryxdesign/*` packages with `require('node:fs')`. The `./vite` export ships only an ESM bundle (`dist/vite.mjs`, esbuild `format: 'esm'`), where esbuild lowers `require` to a shim that throws `Dynamic require of "node:fs" is not supported` — always, since native `require` never exists under ESM. The surrounding `try/catch` swallowed the throw, so `optimizeDeps.exclude` silently fell back to `['@astryxdesign/core']` and every other installed Astryx package stayed eligible for Vite pre-bundling, which strips `stylex.create`/`defineVars` calls and causes runtime errors.

The discovery now uses a static `import fs from 'node:fs'`, which esbuild preserves as a real ESM import. A regression test compiles `vite.ts` with the same esbuild options as `build.mjs` and runs the discovery in a child `node` process, since in-process test runners provide a `require` shim that masks the bug.

@is-jain
