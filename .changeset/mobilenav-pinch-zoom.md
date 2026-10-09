---
'@astryxdesign/core': patch
---

[fix] MobileNav no longer blocks pinch-zoom while it is open. The open nav covers the whole viewport and declared `touch-action: none` (with `pan-y` on its content), so a pinch anywhere on screen did nothing. It now declares `pinch-zoom` (and `pan-y pinch-zoom` on the content): pans are still kept from reaching the page behind, and a pinch zooms the page.

@cixzhang
