---
'@astryxdesign/core': patch
---

[fix] `plainDateToInstant` resolves wall times that daylight saving skips or repeats the way Temporal's default `"compatible"` disambiguation does (AST-067).

- A skipped wall time moves forward by the length of the gap. In a zone that springs forward from a negative offset at local midnight, such as America/Santiago on September 6, 2026 or America/Havana on March 8, 2026, the start of that day came back as 11:00 PM the day before, so a week or day range landed on the wrong date; it is now the day's first instant (1:00 AM).
- A repeated wall time resolves to its earlier occurrence in every zone. In zones with a positive offset, such as Europe/Berlin on October 25, 2026, it resolved to the later one.

@cixzhang
