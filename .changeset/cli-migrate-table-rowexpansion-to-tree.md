---
'@astryxdesign/cli': patch
---

[feat] Add the `migrate-table-rowexpansion-to-tree` codemod (runs on `astryx upgrade`): rewrites the removed `useTableRowExpansionState` tree pattern to `useTableTreeState` + `useTableTreeData`. Detail-panel usage (`renderExpanded`) is left untouched. (#4884)

@humbertovirtudes
