---
'@astryxdesign/core': patch
---

[fix] BottomSheet: in WebKit, an update inside an open sheet no longer holds up the page about 40 ms longer than it should (measured in Playwright's WebKit on a phone-sized page). The open sheet's dialog places its panel with a flex row instead of a grid; the layout is the same.

@vjeux
