---
'@astryxdesign/core': patch
---

[feat] `useTableRowExpansion` accepts `hasRowClickExpansion`, so a row opens when you click anywhere on it and not only on its chevron. (#5995)
@ernestt

`useTableTreeData` has had this since it shipped, under the same name and with the same behaviour. The detail-panel plugin is the other half of the same pair — one expands into child rows, one expands into a panel — and a caller who moved between them lost whole-row clicking without anything saying why. There was no way to add it back either: a click handler on the row has to know not to fire on a checkbox, a link or the end of a text drag, and none of that is reachable from the outside.

Off by default, and pointer-only when on. The chevron button stays the accessible control, so keyboard and assistive-tech users are unaffected — this adds a shortcut for a mouse, not a second way to operate the table. Clicks that land on interactive cell content, clicks that end a text selection, and clicks on rows `getIsItemExpandable` has ruled out all pass through untouched. The chevron already stops propagation, so it does not toggle twice.

Collapsed rows are wired up as well as expanded ones, which is most of the point: the row you want to click is the one that has not opened yet.
