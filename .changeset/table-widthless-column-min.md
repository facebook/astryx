---
'@astryxdesign/core': patch
---

[fix] Table: columns declared without `width` now stop shrinking at a content-derived minimum, so a narrow table scrolls instead of crushing.

A width-less column still takes an equal share of the row, but it no longer
shrinks below the room its header label and its longest word need (sampled
from the first five rows, plus cell padding, clamped to 80–240px). Below the
sum of those minimums the table scrolls in its own Scroll region instead of
breaking IDs, names, and dates mid-word. Columns with `width` are unchanged;
selection and pinned columns keep their offsets. A consumer `style.minWidth`
smaller than the computed table minimum now yields to it, as it already did
for `proportional()` columns.

@thedjpetersen
