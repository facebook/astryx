---
'@astryxdesign/core': patch
---

[feat] Calendar: `weekStartsOn` now also accepts a three-letter day name (`'sun'`–`'sat'`, case-insensitive) in addition to the numeric `0`–`6`, so the starting day is self-documenting at the call site (e.g. `weekStartsOn="mon"`). Numbers keep working unchanged. Adds an exported `DayOfWeekName` type and a `normalizeDayOfWeek` helper (#2843)
@durvesh1992
