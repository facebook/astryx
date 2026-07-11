---
'@astryxdesign/core': patch
---

[fix] Table sort: group NaN cells with null instead of corrupting the order (#3585)

A NaN cell hit the numeric fast path in defaultCompare, and the NaN comparator result reads as "equal" to Array.sort — making the comparator inconsistent and silently mis-ordering the other, valid rows. NaN now sorts to the end alongside null/undefined.
@arham766
