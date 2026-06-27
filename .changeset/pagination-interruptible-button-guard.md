---
'@astryxdesign/core': patch
---

[fix] `Pagination`'s `changeAction` is now interruptible — page changes run in a transition with optimistic page state, so rapid prev/next clicks advance through pages instead of being dropped. `Button`'s `clickAction` keeps its single-fire guard.
@cixzhang
