---
'@astryxdesign/core': patch
---

[feat] `List` gains `hasAnimatedChanges`. On an iPhone or iPad (WebKit on iOS under a finger), when rows are inserted, removed or reordered, the rows that stay slide to their new places and new rows fade in, on the spring an iOS table uses. A row swiped away with a removal action leaves only its gap to close, and the rows below slide up into it. Page content below the list moves with its rows; `followingContent="stays"` keeps it still. Off by default; on other touch screens and with a mouse nothing moves.

@vjeux
