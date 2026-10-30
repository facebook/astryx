---
'@astryxdesign/core': patch
---

[fix] MobileNav locks the page through the shared scroll lock (`useScrollLock`) while it is open. Under a finger, a drag on the open drawer no longer scrolls the page behind it, and overlays open together share one lock. Under any pointer, on a full-height page (`html, body { height: 100% }`) whose `<body>` sets its own overflow, opening and closing the drawer no longer sends the page back to its top.

@vjeux
