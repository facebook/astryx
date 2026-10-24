---
'@astryxdesign/core': patch
---

[chore] Internal: browser proofs for the picker wheel in Chromium and WebKit. A flick coasts on UIKit's curve onto the row it projects and commits on arrival. A finger landing on a coasting wheel stops it, and it then eases onto the nearest row. A storyboard films a flick and its coast. In Chromium, the coast also keeps advancing every frame while the main thread is blocked, and does no Layout or Paint per frame.

@vjeux
