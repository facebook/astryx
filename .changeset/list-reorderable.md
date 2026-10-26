---
'@astryxdesign/core': patch
---

[feat] `createReorderable({onReorder, isReorderable})` makes a collection's reorder behavior, and `List` takes it as `reorderable`: each `ListItem` with an `itemKey` gets a reorder handle at its end, and each committed move calls `onReorder({key, to})` once, with the row's key and its index after the move. On a touch screen a finger held still on a handle picks up its row the way an iOS table's reorder control does (a flick on it still scrolls): the row follows the finger, the rows it passes slide out of its way, the page scrolls near the edges, and on release the row settles into its new place on UIKit's springs. A mouse drags a handle at once, and rows take their places without motion. From the keyboard, Space or Enter picks a row up, the arrow keys, Home and End move it, Space or Enter drops it and Escape puts it back. A List without `reorderable` loads none of the reorder code.

@vjeux
