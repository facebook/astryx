---
'@astryxdesign/core': patch
---

[feat] Add `useTableRowStatus`, a plugin that prepends a narrow column
signaling per-row status.

- Compact per-row status signal (error, warning, unread, etc.) without a
  dedicated status column: a colored status dot by default, or an icon when
  provided.
- `getStatus(item)` maps a row to `{color, icon?, label?}`, or `null` for no
  indicator. `color` accepts a semantic status name
  (`success`/`error`/`warning`/`accent`/`red`/`green`/etc.) mapped to a theme
  token, or a raw CSS color as an escape hatch.
- `icon` renders the status as a shape signifier instead of the dot, which is
  more accessible than color alone when multiple statuses coexist. `label`
  supplies the accessible name.
- Memoize `getStatus` with `useCallback` for a stable plugin identity.

@humbertovirtudes
