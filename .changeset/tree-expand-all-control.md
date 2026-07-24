---
'@astryxdesign/core': patch
---

[feat] Table tree: add an optional expand-all/collapse-all header control (#4142)

`useTableTreeState` now returns an aggregate `isAllExpanded` state (`true` / `false` / `'indeterminate'`) and threads `expandAll` / `collapseAll` into `treeConfig`. `useTableTreeData` gains a `hasExpandAllControl` prop: when set, it renders an expand-all/collapse-all toggle in the tree column header, wired to that state, so consumers no longer need to hand-roll external buttons. Flat data stays a full no-op. This is the first affordance folded in from `useTableRowExpansion` as part of converging the two tree plugins.

@humbertovirtudes
