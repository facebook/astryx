---
'@astryxdesign/core': patch
---

[fix] NumberInput: an entry past `min`/`max` now commits at the nearest bound on blur or Enter instead of falling back to the last in-range prefix — typing 100 into a 1–2 field lands on 2, not 1. Pagination inherits this.

@cixzhang
