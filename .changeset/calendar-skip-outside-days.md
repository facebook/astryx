---
'@astryxdesign/core': patch
---

[fix] `Calendar`: the arrow keys, Home and End no longer land on a borrowed adjacent-month day (shown dimmed, exposed as disabled, and inert to Enter, Space and clicks). An arrow crosses into that month and focuses the real day there, including across the two grids of a two-month view; Home and End stop at the first or last enabled day of the week in the month shown. A month with no enabled day holds no Tab stop.

@cixzhang
