---
'@astryxdesign/cli': patch
---

[fix] `astryx integration check --strict` prints each finding once. The checks' own output shows its message and fix, and the closing "Failing under --strict" list names each failure by check, code and place only, so a long report is no longer doubled.

@josephfarina
