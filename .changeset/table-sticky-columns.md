---
'@astryxdesign/core': patch
---

[feat] Add `useTableStickyColumns` — pin a contiguous run of `Table` columns to
the start and/or end edge with cumulative offsets and scroll-aware drop shadows.
Configure with `{ startKeys, endKeys }`; an empty config is a valid no-op.

This also extends the `TablePlugin` contract so plugins can reach the layout
region and reason about column position:

- New `transformScrollWrapper` hook (+ `ScrollWrapperRenderProps`) lets plugins attach a `ref`
  to the horizontal scroll container and inject before/after chrome.
- `transformHeaderCell` / `transformBodyCell` now receive `columnIndex` and the
  full ordered `columns` list (also surfaced on the render props), enabling
  position-aware plugins such as sticky columns. Existing plugins are unaffected
  — the new args and methods are additive and optional.
  @humbertovirtudes
