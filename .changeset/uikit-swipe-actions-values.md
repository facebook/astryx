---
'@astryxdesign/core': patch
---

[chore] Internal: the UIKit values of a swipe-action row (the swipe threshold, the spring the row follows the finger and settles with, its Reduce Motion behavior, the touch claim distance the web needs) and the release rule that picks closed, open or fire (a fast release goes the way it moves, a slow one by where it is, and only a release past the commit point fires), checked against 50 releases read from UIKit. Not exported from the package entry point; no component uses it yet.

@vjeux
