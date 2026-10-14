---
'@astryxdesign/core': patch
---

[fix] `ResizeHandle`: a separator whose region sets no `maxSize` now reports an `aria-valuemax` — a measured extent standing in for the missing maximum (the window's extent on the region's axis, or the container's content box while a percentage bound observes it), never below the current size or, while collapsed, the minimum. Pixel-only regions inside a container still report no maximum (measuring one would add an observer). `ResizableProps` is unchanged; End still moves only to a configured maximum.

@cixzhang
