---
'@astryxdesign/core': patch
---

[fix] `ResizeHandle`: on a collapsed pane, the arrow that grows it reopens it at the size it had before it collapsed (a single step below the collapse threshold used to leave it collapsed); the arrow that shrinks it stays a no-op. A hand-built region reopens at its minimum.

@cixzhang
