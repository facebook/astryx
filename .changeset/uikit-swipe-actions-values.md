---
'@astryxdesign/core': patch
---

[chore] Internal: the UIKit values of a swipe-action row (the swipe threshold, the spring the row follows the finger and settles with, the touch claim distance the web needs) and the release rule that picks closed, open or fire (a fast release goes the way it moves, a slow one by where it is, and only a release past the commit point fires), checked against 44 of the 51 releases the UIKit lab read in its batch 10a and against its slow and moving-back releases of batch 38. Not exported from the package entry point.

@vjeux
