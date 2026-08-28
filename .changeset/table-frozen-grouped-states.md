---
'@astryxdesign/core': patch
---

[fix] Table keeps grouped headings and selected-row washes visible across frozen columns while scrolling sideways (#5454)

`useTableGroupedRows` pins its default heading and collapse control to the table's start edge. `useTableSelection` now publishes and withdraws the selected-row overlay with the row background, so the wash continues under sticky cells.

@ernestt
