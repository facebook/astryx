---
'@astryxdesign/core': patch
---

[fix] An app bundled into one esbuild file (no code splitting, as no-build pages are) no longer crashes on first render with a TypeError such as "Cannot read properties of undefined (reading 'useId')" or "(reading 'useEffect')", for example when it uses `List` or `Button`. Core now declares its barrel modules side-effectful, so esbuild keeps their module initialization.

@cixzhang @duytbp
