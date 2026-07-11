---
'@astryxdesign/core': patch
---

[fix] paginateData clamps invalid page numbers instead of slicing from the end (#3593)

A negative page fed a negative start index to Array.slice, which counts from the end of the data — page -1 returned the dataset's tail dressed up as a page — and fractional pages returned slices straddling two pages. page now gets the same coercion pageSize received in #3380.
@arham766
