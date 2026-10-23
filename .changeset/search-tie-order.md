---
'@astryxdesign/cli': patch
---

[fix] `astryx search` orders results the matcher scored the same by fit instead of by name: below the first result, a part of it leads (BadgeCountBadges after Badge), then the result matching the query's rarer words. Scores and the first result are unchanged.

@josephfarina
