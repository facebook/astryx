---
'@astryxdesign/core': patch
---

[fix] Calendar / DateInput / DateTimeInput: defensively clamp `numberOfMonths` to its `1 | 2` type at runtime. Out-of-range values (e.g. `0` rendered nothing, `1000` locked the page up in `Array.from({length})`) fall back to a single month. DateInput and DateTimeInput inherit the guard since they forward the prop to `<Calendar>` (#2704)
@durvesh1992
