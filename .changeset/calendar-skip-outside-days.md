---
'@astryxdesign/core': patch
---

[fix] `Calendar`: the arrow keys no longer land on a borrowed adjacent-month day (shown dimmed and exposed as disabled, so Enter and Space picked nothing); they cross into that month and focus the real day there. Clicking a borrowed day still navigates as before.

@cixzhang
