---
'@astryxdesign/core': patch
---

[fix] DateTimeInput: `timeIncrement` is now typed as a literal union of sensible increments (`1 | 5 | 10 | 15 | 30`) instead of an open `number`, so negatives, fractions, and absurd values are rejected at the type level rather than silently accepted. Adds an exported `DateTimeInputTimeIncrement` type (#2725)
@durvesh1992
