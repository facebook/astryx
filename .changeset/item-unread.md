---
'@astryxdesign/core': patch
---

[feat] `Item` gains `isUnread`: unread emphasis for a row standing for something not yet seen (an inbox row). The label takes the semibold weight and the description the primary text colour; the row's ground is left to the theme through a new `unread` state on the `item` theme target, so an app paints its own unread tint without a call-site colour.

@vjeux
