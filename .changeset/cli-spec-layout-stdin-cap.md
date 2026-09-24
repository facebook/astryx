---
'@astryxdesign/cli': patch
---

[fix] `astryx layout check -` and `astryx layout expand -` now stop reading stdin at 5 MB and fail with `ERR_INVALID_ARGUMENT`, the same size cap `--file` already had. Before, an endless or oversized pipe was buffered whole until memory ran out.

@josephfarina
