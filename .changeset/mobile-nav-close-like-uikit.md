---
'@astryxdesign/core': patch
---

[fix] Closing `MobileNav` now runs like an iOS dismissal from start to end. The scrim fades out over the whole slide-out instead of vanishing partway through, and inside `AppShell` the slide-out is no longer cut off at 300 ms. While the drawer slides out nothing takes a tap: not the page, and not the leaving drawer, whose links used to stay live. When the slide-out ends, the dialog closes, the page takes input again and focus returns to the element that opened the drawer.

@vjeux
