---
'@astryxdesign/core': patch
---

[feat] `List` gains `hasAnimatedChanges`. On an iPhone or iPad (WebKit on iOS under a finger), when rows are inserted, removed or reordered, the rows that stay slide to their new places and new rows fade in once the rows sliding past have cleared them, on the spring an iOS table uses. A row that crosses rows moving the other way (a reorder) rides above them with the surface color behind it, as an iOS table's opaque cell does. A removed row collapses in place (a swiped one with its action showing) while the rows below slide up into its gap, as a deleted iOS table cell does. Page content below the list moves with its rows; `followingContent="stays"` keeps it still. With reduced motion on, nothing travels: rows cross-fade into place. Off by default; on other touch screens and with a mouse nothing moves.

@vjeux
