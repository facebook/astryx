---
'@astryxdesign/core': patch
---

[fix] Calendar: the month view now uses a valid ARIA grid structure — the weekday names are `columnheader` cells inside the `grid`, each week is a `row` whose direct children are `gridcell`s, and week-number cells are `rowheader`s. Arrow-key navigation now lands on the correct dates when some days are disabled (via `min`/`max`/`dateConstraints`): moving up/down keeps the true 7-column geometry and skips disabled days to the same weekday, instead of shifting to the wrong weekday. (#3343)
@cixzhang
