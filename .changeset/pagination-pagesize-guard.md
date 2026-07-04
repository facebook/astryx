---
'@astryxdesign/core': patch
---

[fix] Pagination: coerce pageSize to a positive integer so 0/NaN/negative values no longer crash the dots variant (RangeError: Invalid array length) or render Infinity/NaN page counts; the Table pagination plugin applies the same guard since it computes totalPages independently (#3372)
@arham766
