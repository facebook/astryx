---
'@astryxdesign/core': patch
---

[fix] `plainDateToInstant` resolves a wall time that daylight saving skips forward, to the first instant after the gap, instead of an hour before it.

In a zone that springs forward from a negative offset at local midnight — America/Santiago on September 6, 2026, or America/Havana on March 8, 2026 — the start of that day came back as 11:00 PM the day before. Anything that turns a date into its first instant and back, such as a week or day range, landed on the wrong date. The start of such a day is now its first instant (1:00 AM), and any skipped wall time, such as 2:30 AM on a United States spring-forward day, resolves to the matching time after the gap (3:30 AM), as Temporal's default does. Wall times that happen twice and zones with positive offsets resolve as before.

@cixzhang
