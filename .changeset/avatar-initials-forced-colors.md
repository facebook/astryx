---
'@astryxdesign/core': patch
---

[fix] In forced colors (Windows High Contrast), an `Avatar`'s initials now take the color around them, as the browser forces it, instead of always showing CanvasText: inside a control that paints itself disabled they show GrayText, and inside a selected one HighlightText. Outside forced colors nothing changes.

@cixzhang
