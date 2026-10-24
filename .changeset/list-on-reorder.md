---
'@astryxdesign/core': patch
---

[feat] `List` takes `onReorder(fromIndex, toIndex)`: each row gets a reorder handle at its end, and `ListItem`'s new `isReorderDisabled` keeps a row in place. On a touch screen a finger held still on a handle picks up its row the way an iOS table's reorder control does (a flick on it still scrolls): the row follows the finger, the rows it passes slide out of its way, the page scrolls near the edges, and on release the row settles into its new place. A mouse drags a handle at once; from the keyboard, a handle's arrow keys, Home and End move its row, Space picks it up and Escape puts it back.

@vjeux
