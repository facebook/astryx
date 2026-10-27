---
'@astryxdesign/core': patch
---

[fix] Swipe actions on `Item` and `ListItem` run on the gesture system. A row claims a sideways touch at 8 px, before a browser commits to scrolling it. Its swipe begins at UIKit's 25 px, from 0, so a short wobble no longer moves the row. The swipe is a touch, pen and trackpad behaviour, the same on every device: a finger, a pen or a trackpad's two-finger horizontal scroll swipes the row whatever the primary pointer, a touchscreen laptop's included, and a mouse, its wheel and its hover never do. A second finger that lands before the claim leaves the touch to the browser's pinch; once the row has claimed its finger, a second finger no longer cancels the swipe. The click a browser synthesizes after a swipe is cancelled at its source instead of being swallowed by a 400 ms timer.

@vjeux
