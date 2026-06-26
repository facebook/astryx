---
'@astryxdesign/cli': patch
---

[docs] Add rendered example blocks for the two column-axis Table plugin hooks,
shown on their own subcomponent pages:

- `useTableStickyColumns — Pinned Columns` (on /components/useTableStickyColumns)
- `useTableColumnResize — Draggable Columns` (on /components/useTableColumnResize)

Each renders a live, interactive Table in a width-constrained container so the
table's own horizontal scroll container is the scroller (required for sticky
columns to pin and for resize handles to behave). Blocks target the hook via
`exampleFor`, so they appear on the hook pages rather than the main Table page.
@humbertovirtudes
