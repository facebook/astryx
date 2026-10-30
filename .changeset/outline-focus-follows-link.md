---
'@astryxdesign/core': patch
---

[fix] Following an `Outline` link moves focus to the chosen section, as a native in-page link moves the focus starting point, so the next Tab continues from that section instead of jumping back to the top of the page. The section is focused without scrolling, so Outline's own scroll is unchanged.

@cixzhang @duytbp
