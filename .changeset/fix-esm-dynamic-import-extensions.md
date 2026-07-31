---
'@astryxdesign/core': patch
---

[fix] Dynamic `import()` specifiers now get their mandatory `.js` extension in the published ESM dist — `babel-plugin-add-extensions` only rewrote static import/export declarations, so the lazy Tooltip specifier in `Text`, `Heading` and `Timestamp` shipped extensionless and strict-ESM consumers (Rspack, webpack `fullySpecified`, Node ESM) failed to resolve any component importing them. A new post-build gate (`scripts/check-fully-specified.mjs`) now fails any build whose dist ships an extensionless relative specifier. (#4569)
@AKnassa
