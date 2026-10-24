---
'@astryxdesign/core': patch
---

[fix] Swipe actions on `Item` and `ListItem` run on the gesture system. A row claims a sideways touch at 8 px, before a browser commits to scrolling it. On iOS its swipe begins at UIKit's 25 px, from 0, so a short wobble no longer moves the row; on Android and any other touchscreen the row still moves from the touch-down. The pan is published as `Item.swipe`. A second finger before the claim leaves the touch to the browser's pinch, and after it is ignored. The click a browser synthesizes after a swipe is cancelled at its source instead of being swallowed by a 400 ms timer. The row's motion and where a release lands are unchanged.

@vjeux
