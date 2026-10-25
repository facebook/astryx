---
'@astryxdesign/core': patch
---

[chore] Internal: a pager for touch presentations that pages like a UIKit paging scroll view. A horizontal pan moves the pages one to one and rubber-bands at the ends. The release picks the page with UIKit's rule and settles on UIKit's paging curve on the compositor, and a finger can catch it mid-flight. Its settle spring and `setContentOffset`'s duration and curve are motion roles (`paging.settle`, `paging.animatedScroll.durationMs`, `paging.animatedScroll.curve`) that a theme can retune. Not exported from the package entry point.

@vjeux
