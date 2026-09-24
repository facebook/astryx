---
'@astryxdesign/cli': patch
---

[fix] `astryx theme template` now reports a file it cannot write with the stable `ERR_WRITE_FAILED` code. Before, the `--json` error envelope carried the raw system error name, such as `EEXIST` or `EISDIR`, as its `code`.

@josephfarina
