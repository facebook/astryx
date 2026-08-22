---
'@astryxdesign/core': patch
---

[fix] useTableGroupedRows: stop running column `renderCell` functions against synthetic group-header rows, which was crashing any table whose renderer keys a lookup off a field. The header Proxy resolving unknown fields to `''` only ever rescued renderers that _print_ a field — `STATUS_META[item.status].dot` throws on `''` exactly as it would on `undefined`, and BaseTable evaluates every column's `renderCell` on every row before `transformBodyRow` can discard a header's cells. The plugin now skips those calls outright; the cells were being thrown away moments later regardless.

Also returns `isGroupHeader` from the hook, so consumers can guard their own row-level plugins and handlers (click-to-open-detail, row links, per-row menus) without string-matching the `__group_` key prefix.

@ernesttien
