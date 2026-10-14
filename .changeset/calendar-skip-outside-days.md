---
'@astryxdesign/core': patch
---

[fix] `Calendar`: the arrow keys, Home and End no longer land on a borrowed adjacent-month day (shown dimmed, exposed as disabled, and inert to Enter, Space and clicks); they cross into that month and focus the real day there, including across the two grids of a two-month view. A month with no enabled day holds no Tab stop.

@cixzhang
