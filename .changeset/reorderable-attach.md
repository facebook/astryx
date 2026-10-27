---
'@astryxdesign/core': patch
---

[feat] `createReorderable` takes `positions()` for a layout such as a grid or a fanned hand: one slot centre per item, so a drag follows the pointer on both axes, drops the item on the slot nearest its centre, and settles it on that slot's centre, and reorder mode's arrow keys and hint follow the layout's rows and columns (Left and Right along a row, all four in a grid, a row and a column in the announcement). Its new `attach(container, {items})` reorders plain elements with no collection component: each item's handle becomes reorder mode's toggle, named after its item and in the Tab order (a rejected or keyless item's handle is hidden), the container gets the drag and reorder mode with their announcements through the shared announcement channel, following the primary pointer as it turns coarse or fine, and `detach()` removes everything it added.

@vjeux
