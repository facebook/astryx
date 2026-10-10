---
'@astryxdesign/core': patch
---

[fix] Keep Table column resize handles accessible, contained, and compatible with sticky columns (#6194).

Resize handles stay keyboard-reachable on touch-first devices instead of disappearing from the accessibility tree. They no longer extend below the table and create stray vertical scrolling, and sticky headers keep their pinned positioning regardless of plugin order.

@ernestt
