---
'@astryxdesign/core': patch
---

[fix] An app bundled into one esbuild file (no code splitting, as no-build pages are) no longer crashes on first render with "Cannot read properties of undefined (reading 'useId')" when it uses `List`. Core now declares its barrel modules side-effectful, so the bundler keeps their module initialization.

@cixzhang @duytbp
