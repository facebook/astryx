---
'@astryxdesign/core': patch
---

[fix] `ResizeHandle`: Enter and double-click on a collapsed pane restore it to the size it had before it collapsed, not to its minimum, and reopen it even when `minSize` is below `collapsedSize`. The handle uses `useResizable`'s own collapse and expand transitions; `ResizableProps` is unchanged, and a hand-built props object keeps the previous resize-to-minimum behavior.

@cixzhang
