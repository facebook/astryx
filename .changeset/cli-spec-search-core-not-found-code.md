---
'@astryxdesign/cli': patch
---

[fix] `astryx search` now fails with `ERR_CORE_NOT_FOUND`, like `component` and `hook`, when `@astryxdesign/core` cannot be found, instead of the catch-all `ERR_UNKNOWN`.

@josephfarina
