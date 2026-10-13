---
'@astryxdesign/core': patch
---

[fix] `Calendar`: PageUp and PageDown move the focused day by a month — into the month the grid shows, on the same day of the month where it exists — instead of by a week; from a borrowed adjacent-month day the target is pulled into the month now shown instead of dropping focus to the page. With two months, a page or an arrow crossing a month edge from the first month now lands on the correct day (the second grid no longer overrides the first grid's target).

@cixzhang
