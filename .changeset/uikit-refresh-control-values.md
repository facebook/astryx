---
'@astryxdesign/core': patch
---

[experimental] The UIKit constants table read through `@astryxdesign/core/motion/experimental` gains UIRefreshControl's values as `uikit.refreshControl`: the refreshing inset, the trigger distance against the scroll view's height, the pull after the trigger, the indicator's reveal, spin and exit, and the end-of-refresh clock, each measured on the iOS 26.2 simulator or labelled a guess with its measurement task. Three of them are motion roles a theme may retune (`refreshControl.endMs`, `refreshControl.spinMs`, `refreshControl.triggerTurnSpring`).

@vjeux
