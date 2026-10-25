---
'@astryxdesign/core': patch
---

[fix] MobileNav locks the page through the shared scroll lock (`useScrollLock`) while it is open. Under a finger, a drag on the open drawer no longer scrolls the page behind it, and overlays open together share one lock.

@vjeux
