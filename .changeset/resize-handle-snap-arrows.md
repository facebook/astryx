---
'@astryxdesign/core': patch
---

[fix] `ResizeHandle`: with snap points set, an arrow key moves the pane to the adjacent snap point in its direction (Shift moves two), a point beyond the bounds counting as that bound — a 10px step used to snap straight back to the point it started on. With snap points, a shrink arrow at the lowest point no longer collapses a collapsible pane; Enter, double-click and dragging still do.

@cixzhang
