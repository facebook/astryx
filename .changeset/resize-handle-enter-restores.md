---
'@astryxdesign/core': patch
---

[fix] `ResizeHandle`: Enter and double-click on a collapsed pane restore it to the size it had before it collapsed, not to its minimum, and reopen it even when `minSize` is below `collapsedSize`. `useResizable`'s props gain optional `_collapse`/`_expand` so a handle can use the hook's own transitions; hand-built props without them keep the previous behavior.

@cixzhang
