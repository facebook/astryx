---
'@astryxdesign/core': patch
---

[feat] Add `useTableRowStatus` — a plugin that prepends a narrow column
rendering a full-height colored bar on each row's leading edge.

- Compact per-row status signal (error, warning, unread, etc.) without a
  dedicated status column.
- `getStatus(item)` maps a row to `{color, label?}` (any CSS color/token +
  optional accessible label), or `null` for no indicator.

@humbertovirtudes
