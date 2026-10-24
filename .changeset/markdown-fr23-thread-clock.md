---
'@astryxdesign/core': patch
---

[chore] Markdown's FR23 performance bench times each sampling window on the main thread's CPU clock instead of the wall clock, so time other processes take no longer counts against the budget. Test-only; `Markdown`'s behavior does not change.

@vjeux
