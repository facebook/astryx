---
'@astryxdesign/core': patch
---

[chore] Make `@stylexjs/stylex` an optional `peerDependency` and bundle its runtime into the build. Compiled components now import a self-contained vendored runtime (`dist/_vendor/stylex.js`), so the package works at runtime with no StyleX installed. Types still reference the optional peer to avoid `unique symbol` brand conflicts at the public `xstyle` prop — consumers who use `xstyle` already install StyleX to author the value.

@imdreamrunner
