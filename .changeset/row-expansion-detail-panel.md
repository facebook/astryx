---
'@astryxdesign/core': minor
---

[breaking] useTableRowExpansion is now a detail-panel plugin: it expands a full-width panel below a row via renderExpanded(item), and useTableRowExpansionState is removed. For hierarchical/tree tables (child rows that reuse the parent columns), migrate to useTableTreeData + useTableTreeState. See the migration example on the useTableRowExpansion docs. (#4609)

**Codemod:** `npx astryx upgrade --apply` runs `migrate-table-rowexpansion-to-tree`, which rewrites tree-mode `useTableRowExpansion` call sites onto `useTableTreeData` + `useTableTreeState`.

@humbertovirtudes
