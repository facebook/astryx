---
'@astryxdesign/cli': patch
---

[fix] `astryx theme palette generate` now reports an output or preview path it cannot use, such as one below a regular file, with the stable `ERR_WRITE_FAILED` code. Before, the `--json` error envelope carried the raw system error name, such as `ENOTDIR`, as its `code`. (#6533)

@josephfarina
