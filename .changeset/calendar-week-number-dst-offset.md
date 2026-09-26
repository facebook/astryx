---
'@astryxdesign/core': patch
---

[fix] `plainDateGetWeekNumber` (and `Calendar`'s `getWeekNumber`/`hasWeekNumbers`) now compute the ISO week number entirely in UTC instead of through a local `Date`. A `PlainDate` carries no timezone, but the previous implementation routed through `plainDateToDate`'s local-time `Date`, whose millisecond distance across a DST boundary is not an exact multiple of 24h. In any zone where DST ends after New Year (Sydney, Auckland, Santiago), every date from the DST-end transition through the rest of the year reported one week too high in a year starting on a Friday, such as 2021 or 2027. (#6364)

@HelloOjasMutreja
