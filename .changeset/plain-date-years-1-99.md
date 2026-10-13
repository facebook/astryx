---
'@astryxdesign/core': patch
---

[fix] `Calendar`: dates in years 1-99 now show their own year instead of 1900-1999. A value of `0001-01-15` was captioned "January 1901" with 1901's weekday layout and day labels, while `onChange` still emitted the year-1 ISO date. The shared date helpers behind the caption, day grid, week numbers, day counts, and timezone instants now keep years 1-99 as given.

@harjothkhara
