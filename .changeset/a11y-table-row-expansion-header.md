---
'@astryxdesign/core': patch
---

[fix] Table useTableRowExpansion: the chevron gutter's column header now carries a visually hidden localized name ("Row expansion", key `@astryx.tableRowExpansion.columnHeader`) instead of an empty `<th>` (axe empty-table-header, WCAG 1.3.1 best practice). The gutter stays visually blank (#5383).
@cixzhang
