---
'@astryxdesign/core': patch
---

[perf] Popover under a finger: the touch presentation now starts in the next animation frame, before that frame paints, instead of in the task that opens the popover, so opening one lays the page out no more often than opening it with a mouse.

@vjeux
