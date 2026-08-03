---
'@astryxdesign/core': patch
---

[fix] useTablePagination: with `position='both'` the two pagination `<nav>` landmarks now get distinct accessible names — "{label} (top)" above the table and "{label} (bottom)" below it (axe landmark-unique). Consumer-supplied `label` values are interpolated into both names; single-position labels are unchanged.
@AKnassa
