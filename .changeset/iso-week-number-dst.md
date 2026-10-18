---
'@astryxdesign/core': patch
---

[fix] Compute ISO week numbers (`Calendar hasWeekNumbers`, `getWeekNumber`) on UTC anchors instead of local-time `Date` arithmetic. In timezones whose DST ends after New Year (Sydney, Auckland, Santiago), the local-millisecond difference between the week's Thursday and January 1 carried the DST offset, and in years whose January 1 is a Friday that extra hour rounded a whole week up: the entire ISO week 14 of April 2021 displayed as week 15. Week numbers are now identical in every timezone.

@ManoharPaturi
