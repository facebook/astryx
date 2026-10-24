---
'@astryxdesign/core': patch
---

[chore] Internal: the UIKit constants table gains UIRefreshControl's values (`refreshControl`): the refreshing inset, the trigger distance against the scroll view's height, the pull after the trigger, the indicator's reveal, spin and exit, and the end-of-refresh clock, each measured on the iOS 26.2 simulator or labelled a guess with its measurement task. Four of them are motion roles a theme may retune (`refreshControl.endMs`, `refreshControl.exitMs`, `refreshControl.spinMs`, `refreshControl.triggerTurnSpring`). Not exported from the package entry point; no component reads it yet.

@vjeux
