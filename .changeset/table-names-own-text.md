---
'@astryxdesign/core': patch
---

[fix] `Table` names say what they belong to. A sort button is named by its column's text, so the column header keeps that name; the sort direction comes from the header's `aria-sort`, and while several columns sort, each button is described by its priority ("Priority 2 of 3"). The scroll region takes the table's own name (its `aria-label` or `aria-labelledby`) instead of a generic "Table" on every table.

@cixzhang @duytbp
