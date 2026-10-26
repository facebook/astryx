---
'@astryxdesign/core': patch
---

[fix] BottomSheet: in Safari, an update inside an open sheet no longer holds up the page about 40 ms longer than it should. The open sheet's dialog places its panel with a flex column instead of a grid; the layout is the same.

@vjeux
