---
'@astryxdesign/core': patch
---

[feat] Add `useTableRowExpansion` — expand/collapse rows to reveal a full-width
detail panel below them.

- Injects a chevron column; clicking (or right-click → "Expand/Collapse row")
  toggles the expanded content rendered by `renderExpanded(item)`.
- Headless: consumer owns `expandedKeys` state; the plugin provides the UI.
- Contributes a context-menu action for expand/collapse (via the
  `contextMenuActions` system).
- Also adds `afterRow` support to `BodyRowRenderProps` + `BaseTable` (a small
  additive core addition that enables any plugin to append extra `<tr>` content
  after a row).
@humbertovirtudes
