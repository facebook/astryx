---
'@astryxdesign/core': patch
---

[fix] Stop `useTableColumnResize` handles from adding stray vertical scroll

The resize handles span the whole table so their indicator line reads down
through the body rows. They were given the table's full height but hung from a
point a few pixels below its top edge, so each one ended that far past the last
row. The table's scroll wrapper only exists to scroll horizontally, but CSS
promotes its `overflow-y` to `auto` as soon as `overflow-x` is, so the overhang
turned into ~6px of vertical scrolling on a table that had no reason to scroll.

The observer that measures the table now also measures how far the handles
start below its top edge and publishes it as `--table-resize-offset`, which the
handles subtract from their height. The drop is per-cell — a handle hangs from
its cell's content box, and the header's vertical centring shifts that box by an
amount that depends on how tall each header's own content is — so the largest is
published: a handle can stop a fraction short of the last row without anyone
noticing, but it cannot hang past it.

@ernestt
