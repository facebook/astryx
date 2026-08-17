---
'@astryxdesign/core': patch
---

[feat] DateRangeInput / Calendar: add `maxRangeSpan` and `minRangeSpan` to constrain the size of a selected range. Once a start date is picked, days outside the allowed window are disabled — e.g. `maxRangeSpan={7}` keeps the range within a 7-day window of the start.

@freddymeta
