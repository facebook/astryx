---
'@astryxdesign/core': patch
---

[feat] `List` gains `hasAnimatedChanges`. Under a finger (a coarse primary pointer, iOS and Android alike), when rows are inserted, removed or reordered, the rows that stay slide to their new places and new rows fade in once the rows sliding past have cleared them, on the spring an iOS table uses. A row that crosses rows moving the other way (a reorder) rides above them with the surface color behind it, as an iOS table's opaque cell does. A removed row collapses in place (a swiped one with its action showing) while the rows below slide up into its gap, as a deleted iOS table cell does. Page content after the list takes its new place by layout at once; nothing moves it. With reduced motion on, nothing travels: rows cross-fade into place. Off by default; with a mouse nothing moves.

@vjeux
