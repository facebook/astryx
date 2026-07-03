---
'@astryxdesign/core': patch
---

[fix] NavHeadingMenu: `onClick`-only items (rendered without an `href`) now activate on Enter and Space. Previously these `role="menuitem"` elements had no keyboard activation, so keyboard and screen-reader users could focus them but not trigger them (#3333)
@cixzhang
