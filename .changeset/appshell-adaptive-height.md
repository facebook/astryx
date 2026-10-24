---
'@astryxdesign/core': patch
---

[feat] AppShell accepts `height="adaptive"`: `fill` with a mouse or trackpad, `auto` where the primary pointer is touch (`(pointer: coarse)`). With `fill`, the main region scrolls inside a viewport-high shell, so a phone browser never sees the page scroll: a status-bar tap does not return to the top, and the toolbar does not minimize. `adaptive` lets the page scroll under the sticky header on touch devices and keeps independent scroll regions on desktops. The root now reports which element scrolls in `data-scroll-owner` (`content` for the main region, `document` for the page), for code that listens to or restores the scroll position. `fill` and `auto` are unchanged, and `fill` stays the default.

@vjeux
