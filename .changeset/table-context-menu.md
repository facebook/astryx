---
'@astryxdesign/core': patch
---

[feat] Add a plugin-contributed right-click context-menu system to `Table`.
Right-clicking a column header or a row shows a menu of actions aggregated from
every enabled plugin (instead of the browser's generic menu).

- New `TableContextAction` type and an optional `contextMenuActions` field on
  `HeaderCellRenderProps` / `BodyCellRenderProps`. Plugins append their actions
  inside the existing `transformHeaderCell` / `transformBodyCell` transforms;
  the table concatenates them across plugins (never overridden), the same way
  `styles` are merged.
- The cell components (`TableHeaderCell` / `TableCell`) own the menu wrapper and
  render it around their own content via the `ContextMenuActions` prop, so the
  cell controls how the wrapper interacts with padding / content sizing — and
  row menus work without invalid `<tr>` nesting. Actions group with dividers and
  show a checkmark for the active item; when none are contributed, the native
  browser menu passes through.
- `contextMenuActions` accepts either an array or a getter
  (`() => TableContextAction[]`); the getter is resolved lazily when the menu
  opens, so plugins with state-derived actions don't build arrays on every
  render. `useTableSortable` uses a getter so its checked/clear state always
  reflects the latest sort.
- First contributor: `useTableSortable` adds "Sort ascending / Sort descending
  / Clear sort" on sortable headers.

Built on the `ContextMenu` component. Other plugins opt in by setting
`contextMenuActions` in their cell transforms — no core changes needed.
@humbertovirtudes
