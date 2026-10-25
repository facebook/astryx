---
'@astryxdesign/core': patch
---

[feat] Carousel `hasPaging` shows one full-width child at a time. A swipe, flick, arrow key or button moves exactly one page. Under a finger, on any touch device, the pages follow it, rubber-band at the ends and settle on UIKit's paging curve, even while JavaScript is busy; with `hasLoop`, the page after the last is the first. With a mouse or a trackpad, and under a finger with `hasButtons={false}`, the carousel snaps natively one page at a time. Under Reduce Motion a programmatic scroll cross-fades on a coarse pointer and jumps at once on any other.

@vjeux
