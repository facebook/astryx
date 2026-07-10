---
'@astryxdesign/core': patch
---

[feat] Add `useTableGroupedRows` — groups a flat data array into collapsible
section rows.

- Each distinct `groupBy` value becomes a full-width section-header row with a
  chevron toggle, group label, and member count; collapsing hides that group's
  rows while keeping the header.
- Mirrors `useTableRowExpansionState`: consumer owns the `collapsedGroups` set;
  the hook returns `{data, plugin, getRowKey}` (pass to `Table` data / plugins /
  idKey). Supports `renderGroupHeader` and `groupOrder`.

@humbertovirtudes
