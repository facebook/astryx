---
'@astryxdesign/core': patch
---

[feat] AppShell accepts `height="adaptive"`: `fill` with a mouse or trackpad, `auto` under a finger (a coarse primary pointer, through the shared touch resolver). With `fill`, the main region scrolls inside a viewport-high shell, so a phone browser never sees the page scroll: its toolbar or address bar does not minimize, and on iOS a status-bar tap does not return to the top. `adaptive` lets the page scroll under the sticky header under a finger and keeps independent scroll regions with a mouse. The root now reports which element scrolls in `data-scroll-owner` (`content` for the main region, `document` for the page), for code that listens to or restores the scroll position. `fill` and `auto` are unchanged, and `fill` stays the default.

@vjeux
