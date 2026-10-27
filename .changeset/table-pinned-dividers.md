---
'@astryxdesign/core': patch
---

Table: a pinned column (`useTableStickyColumns`) now draws its own row dividers, so the line under it no longer goes missing while the table scrolls horizontally. Row dividers read `--table-row-divider-width`, `--table-row-divider-style` and `--table-row-divider-color`, which a theme or an app can set on the table, a row or a cell; pinned cells follow them, and an app's own `border-bottom` on a row or cell.
