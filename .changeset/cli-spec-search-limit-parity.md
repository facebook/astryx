---
'@astryxdesign/cli': patch
---

[fix] `astryx search --limit` now refuses a value that is not a positive integer, such as `1.5` or `5abc`, with `ERR_INVALID_ARGUMENT` and exit 1, as `search({limit})` already did, instead of silently truncating it. (#6528)

@josephfarina
