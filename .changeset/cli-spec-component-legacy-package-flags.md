---
'@astryxdesign/cli': patch
---

[fix] `astryx component <Name> --package <pkg>` no longer ignores `--source` and `--blocks` when the package publishes docs through the legacy `astryx.docs` field. `--source` now fails with `ERR_NO_SOURCE`, and `--blocks` returns the blocks, the same answers as without `--package`. Before, both flags silently returned the plain doc.

@josephfarina
