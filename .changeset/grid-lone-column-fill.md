---
'@astryxdesign/core': patch
---

[fix] Grid: with `columns={{minWidth, max}}`, columns that are present now fill the row when fewer than `max` fit. Previously the `max` cap was applied to each track's max size, so a layout collapsing to a single column (e.g. on mobile) left dead space on the right instead of stretching to full width. The cap now limits the column count while letting present columns reach `1fr`. (#3391)

@josephfarina
