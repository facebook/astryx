---
'@astryxdesign/core': patch
---

[fix] Table useTableRowStatus: the status gutter's column header now carries a visually hidden localized name ("Row status", key `@astryx.table.rowStatus.columnHeader`) instead of an empty `<th>` (axe empty-table-header, WCAG 1.3.1 best practice). The gutter stays visually blank.
@AKnassa
