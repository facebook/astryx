---
'@astryxdesign/core': patch
---

[feat] `useTableGroupedRows` takes `hasStickyGroupHeaders`, which pins each group heading to the top of the table's scroll container until the next section pushes it out, so a reader scrolling deep inside a long group can still see which group they are in. A sticky cell leaves its row behind and the row is what carries the heading's fill, so the pinned cell takes an opaque background of its own; it also clears the body cells `useTableStickyColumns` pins, which would otherwise paint over the heading as rows pass beneath. For the offset the two plugins now cooperate: `useTableStickyHeader` measures its header and publishes the height as `--table-sticky-header-height` on the scroll container, and a pinned heading starts below that, the same way the two already share `--table-sticky-background`. Install both and the heading comes to rest under the header instead of hiding it; with no pinned header the variable is unset and the heading pins to the top edge. Both need a scrollport with somewhere to travel, which is what `useTableStickyHeader`'s `maxHeight` is for.

@ernestt
