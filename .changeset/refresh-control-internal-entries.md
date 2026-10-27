---
'@astryxdesign/core': patch
---

[chore] Internal: core's internal entries re-export the page's scroll-style owner (`claimRootScrollStyle`, `isScrollLockActive`, `subscribeScrollLock`), `useGestureRecognizer`, `resolveMotion` and `useAnimator`, so the lab RefreshControl reads them there; a pull to refresh that takes over the page's top edge composes with scroll locks.

@vjeux
