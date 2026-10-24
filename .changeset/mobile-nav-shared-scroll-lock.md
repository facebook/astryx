---
'@astryxdesign/core': patch
---

[fix] MobileNav locks the page through the shared scroll lock (`useScrollLock`) while it is open and until its slide-out ends. On iOS a drag on the open drawer no longer scrolls the page behind it, and other overlays and the pull-to-refresh control see the lock.

@vjeux
