---
'@astryxdesign/cli': patch
---

[refactor] CLI: swizzle reorganized into api/swizzle leaf shape — the flat command splits into `api/swizzle/list` (`swizzle.list`) and `api/swizzle/copy` (`swizzle.copy` receipt, incl. `rewriteImports`), with shared @astryxdesign/core discovery + component listing deduped in `api/swizzle/_adapter.mjs`, and `swizzle.mjs` reduced to a dispatcher + barrel that keeps its existing exports (`swizzle`, `rewriteImports`). Pure reorganization with no behavior change: human output and every `--json` envelope stay byte-identical, and the CLI command, the `./api` barrel, and the central `types/swizzle` declarations are untouched.
@josephfarina
