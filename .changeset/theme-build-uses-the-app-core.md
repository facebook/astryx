---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build` in an app uses the app's installed `@astryxdesign/core`, and says to install Core when there is none.

Run one-off with `npx @astryxdesign/cli`, it failed with "Build @astryxdesign/core first (e.g. `pnpm -F @astryxdesign/core build`)" even when the app had Core installed, because it looked for Core only next to the CLI. It now generates with the Core the project installed, the same Core the app's `<Theme>` runs on. In an app without Core, the error now says to install it (`npm install @astryxdesign/core`). The build command stays only for the Astryx repository itself. The error code (`ERR_CORE_NOT_FOUND`) is unchanged.

@josephfarina
