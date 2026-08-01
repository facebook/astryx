---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build`: the icon-registry import in the generated module is verified against the output directory before anything is written. An extensionless source specifier (`./icons`) is rewritten onto the compiled companion — preferring `.mjs` over `.js`, since with a dual build the `.js` twin is the CJS bundle and hands consumers a second, distinct registry instance — and the build fails with `ERR_THEME_ICON_UNRESOLVED` when no module in the output directory can satisfy the import, instead of silently emitting a module that cannot load anywhere. A registry that exists only as TypeScript source beside the output (in-place builds consumed through a bundler) is kept as-written with a warning.
@AKnassa
