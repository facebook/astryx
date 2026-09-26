---
'@astryxdesign/core': patch
---

[fix] Stop column resize and sticky columns from fighting over pinned headers (#6194)
@ernestt

Both plugins style the same header cell, and both set `position` on it —
`useTableColumnResize` needs `relative` to anchor its handle, sticky columns
needs `sticky` to pin. Sticky set its through a StyleX class rather than inline
as its sibling offsets already were, so the two landed in the same style array
and the later plugin won. A pinned column silently stopped pinning depending on
the order the caller happened to write `plugins={{ ... }}`.

`useTableStickyColumns` now writes `position` inline alongside the offsets it
was already writing there, which outranks either plugin's classes and makes the
composition independent of plugin order rather than dependent on a lucky one.
