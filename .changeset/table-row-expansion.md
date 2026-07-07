---
'@astryxdesign/core': patch
---

[feat] Add `useTableRowExpansion` — expand/collapse tree rows inline.

- Inherited-columns mode: child rows use the same columns as their parents,
  indented by depth. Injects a chevron column; clicking (or right-click →
  "Expand/Collapse row") toggles a row's children.
- Headless: the consumer owns `expandedKeys` state; the plugin provides the UI.
  Pair with `useTableRowExpansionState` to flatten a tree into the visible rows.
- Optional expand-all header toggle via `isAllExpanded` + `onToggleExpandAll`.
- Optional `expandOnRowClick` to toggle by clicking anywhere in the row.
- Contributes a context-menu action for expand/collapse (via the
  `contextMenuActions` system).

@humbertovirtudes
