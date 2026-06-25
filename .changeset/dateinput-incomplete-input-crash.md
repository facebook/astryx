---
'@astryxdesign/core': patch
---

[fix] Prevent `DateInput` from crashing the page while typing an incomplete
date. Typing a leading `0` or `1` (e.g. starting to enter `01` for January)
could coerce the in-progress value into an invalid date with a year of `0`,
which then threw a `RangeError` and crashed the surrounding page. Partial,
not-yet-complete input is now treated as incomplete instead of being parsed
into a date, so the field stays usable as you type.

@cixzhang
