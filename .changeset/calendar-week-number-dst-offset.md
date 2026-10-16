---
'@astryxdesign/core': patch
---

[fix] `plainDateGetWeekNumber` (and `Calendar`'s `getWeekNumber`/`hasWeekNumbers`) now compute the ISO week number entirely in UTC instead of through a local `Date`. A `PlainDate` carries no timezone, but the previous implementation routed through `plainDateToDate`'s local-time `Date`, whose millisecond distance across a DST boundary is not an exact multiple of 24h. In zones where DST ends in the southern autumn (Sydney, Auckland, Santiago), the dates between that transition and the next spring's DST start reported one week too high in a year starting on a Friday, such as 2016, 2021 or 2027 (in Sydney 2021, 2021-04-05 through 2021-10-03). Zones such as New York and London were never affected. (#6364)

@HelloOjasMutreja
