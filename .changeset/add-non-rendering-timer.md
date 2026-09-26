---
'@astryxdesign/core': patch
---

[feat] Add Timer for standardized elapsed durations without React tick renders. (#6438)

Use `Timer` for active-operation elapsed time. It starts from mount by default,
accepts an earlier Unix-millisecond `startTime`, offers `elapsed` and `clock`
formats with adaptive cadence, and matches Timestamp typography props.

@cixzhang
