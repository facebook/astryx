---
'@astryxdesign/core': patch
---

[fix] `Calendar` with `hasWeekNumbers`: the blank cell above the week-number column is now a `columnheader` named with the locale's own word for the week field (from CLDR, visually hidden), so every cell in the header row has a grid role and assistive technology reads the weekday header row without a stray unnamed cell.

@cixzhang
