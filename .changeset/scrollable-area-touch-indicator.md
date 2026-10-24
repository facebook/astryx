---
'@astryxdesign/core': patch
---

[fix] On touch screens, `ScrollableArea` (and Table, CodeBlock and BottomSheet's body, which use it) keeps the platform's own scroll indicator. Its neutral `scrollbar-color` replaced iOS Safari's indicator with a faint bar that was hard to see while scrolling and also showed in the gap a pull opens; iOS now draws its own indicator, only while scrolling. Mouse and trackpad scrollbars keep the neutral colour.

@vjeux
