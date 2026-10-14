---
'@astryxdesign/core': patch
---

[fix] `ResizeHandle`: on a collapsed pane, the arrow that grows it opens it one step above its minimum (a single step below the collapse threshold used to leave it collapsed); the arrow that shrinks it stays a no-op. Enter and double-click still restore the previous size.

@cixzhang
