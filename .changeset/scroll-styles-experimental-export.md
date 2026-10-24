---
'@astryxdesign/core': patch
---

[experimental] `@astryxdesign/core/gestures/experimental` exports the page's scroll-style owner: `claimRootScrollStyle`, `isScrollLockActive` and `subscribeScrollLock`, so a lab component that takes over the page's top edge (a pull to refresh) composes with scroll locks.

@vjeux
