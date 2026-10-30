---
'@astryxdesign/core': patch
---

[perf] Pages with many closed popovers, tooltips and menus mount faster. A layer that renders closed outside an inline or interactive parent no longer reads computed style when it mounts; it reads its writing direction when it first opens, before its first frame. On a page with hundreds of closed layers, each of those mount-time reads forced its own style recalculation. Open layers look and behave as before, in right-to-left and vertical text too.

@cixzhang
