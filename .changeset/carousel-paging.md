---
'@astryxdesign/core': patch
---

[feat] Carousel `hasPaging` shows one full-width child at a time. A swipe, flick, arrow key or button moves exactly one page. Under a finger on iOS the pages follow the finger, rubber-band at the ends and settle on UIKit's paging curve, even while JavaScript is busy; with `hasLoop`, the page after the last is the first. Elsewhere (a mouse, a trackpad, a finger on Android) the carousel snaps natively one page at a time.

@vjeux
