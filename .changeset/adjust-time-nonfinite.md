---
'@astryxdesign/core': patch
---

[fix] adjustTime guards non-finite deltas and wraps negatives in O(1) (#3583)

A non-finite deltaMinutes previously spun the wrap-around loop forever (-Infinity — tab freeze) or produced the corrupt string "NaN:NaN" (NaN) that could be committed into consumer form state through DateTimeInput's timeIncrement path. Non-finite deltas now return the input time unchanged, and the negative wrap-around uses double-modulo instead of a loop.
@arham766
