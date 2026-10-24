---
'@astryxdesign/core': patch
---

[chore] Internal: core's gestures barrel re-exports the page's scroll-style owner (`claimRootScrollStyle`, `isScrollLockActive`, `subscribeScrollLock`), so a lab component that takes over the page's top edge (a pull to refresh) composes with scroll locks. Not exported from the package entry point.

@vjeux
