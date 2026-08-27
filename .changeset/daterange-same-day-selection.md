---
'@astryxdesign/core': patch
---

[fix] DateRangeInput: allow a same-day range when `minRangeSpan` is 1

A repeated click on the range start now commits a one-day range when the
configured minimum permits it, including when a maximum span is also set.
Longer minimum spans keep the existing cancel behaviour so the user can move
the start date.

@freddymeta
