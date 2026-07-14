---
'@astryxdesign/core': patch
---

[feat] Add `useTableRowIndex` — a plugin that prepends a right-aligned,
monospaced row-number column.

- Numbering follows the rendered `data` order, so it reflects the current
  sort / filter / pagination view (pass the sorted/paged array).
- `getRowKey` for stable keyed lookup; `label` and `startFrom` to customize
  the header and starting ordinal.

@humbertovirtudes
