---
'@astryxdesign/core': patch
---

[fix] useResizable and SideNav: expanding after a drag-to-collapse returns to the width from before the drag, not the last width the drag passed on its way below the collapse threshold, and that pre-drag width is what `autoSaveId` persists. A controlled owner that refuses the collapse still keeps the width where the drag left it.

@AKnassa
