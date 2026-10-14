---
'@astryxdesign/core': patch
---

[fix] `Calendar`: PageUp and PageDown move the focused day by a month — into the month the grid shows, on the same day of the month where it exists — instead of by a week; a page from a borrowed adjacent-month day lands on that day of the month now shown rather than on the month's first day. With two months, a page or an arrow crossing a month edge from the first month now lands on the correct day (the second grid no longer overrides the first grid's target). An arrow or page past `min`/`max` changes nothing, and a page into a month with no enabled day keeps focus in the grid.

@cixzhang
