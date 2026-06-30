---
'@astryxdesign/core': patch
---

[feat] Add a plugin-contributed right-click context-menu system to `Table`.
Right-clicking a column header shows a menu of actions aggregated from every
enabled plugin (instead of the browser's generic menu).

- New `TableContextAction` type and an optional `contextMenuActions` field on
  `HeaderCellRenderProps` / `BodyCellRenderProps`. Plugins append their actions
  inside the existing `transformHeaderCell` / `transformBodyCell` transforms;
  the table concatenates them across plugins (never overridden) and renders one
  menu per header cell, built on the `ContextMenu` component. Actions group with
  dividers and show a checkmark for the active item; when none are contributed,
  the native browser menu passes through.
- First contributor: `useTableSortable` adds "Sort ascending / Sort descending
  / Clear sort" on sortable headers.

(Header menus only for now; row-menu rendering is a follow-up pending
`asChild`/Slot support for valid `<tr>` nesting.)
@humbertovirtudes
