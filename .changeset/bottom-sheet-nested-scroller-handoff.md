---
'@astryxdesign/core': patch
---

[fix] BottomSheet hands a touch to the sheet at the scroll edge of the box under the finger, not the body's alone. Content that scrolls inside the body (a pinned header and footer around a scrolling middle, a grid) never moved the body's `scrollTop`, so every pull down over that scrolled box dragged the sheet and the box could not be scrolled back by hand. From the box's top the pull still drags the sheet.

@vjeux
