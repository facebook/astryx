---
'@astryxdesign/core': patch
---

[feat] Add a plugin-contributed right-click context-menu system to `Table`.
Right-clicking a column header shows a menu of actions aggregated from every
enabled plugin (instead of the browser's generic menu).

- New `TableContextAction` type and two optional, backward-compatible
  `TablePlugin` methods: `getHeaderContextActions(column, columnIndex)` and
  `getRowContextActions(item, rowIndex)`.
- Plugins *contribute* actions; the table aggregates them into one menu per
  header cell (built on the `ContextMenu` component). Actions group with
  dividers and show a checkmark for the active item. When no plugin contributes
  actions, the native browser menu passes through.
- First contributor: `useTableSortable` adds "Sort ascending / Sort descending
  / Clear sort" on sortable headers.

Other plugins can opt in by implementing the same two methods — no core changes
needed. (Header menus only for now; row-menu rendering is a follow-up pending
`asChild`/Slot support for valid `<tr>` nesting.)
@humbertovirtudes
