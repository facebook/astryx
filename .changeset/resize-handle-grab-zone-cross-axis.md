---
'@astryxdesign/core': patch
---

[fix] ResizeHandle: dragging the lower half of a tall handle works again. The invisible grab zone is stretched along the handle, but the offset that biases it onto the pill also carried the pill's own `-50%` centering shift — so the zone slid half the handle's length off the divider. On a full-height panel at 1440x900 the 16x900 hit box sat at y=-434, leaving everything below the pill's centre dead: a pointerdown on the visible grip's centre, or anywhere lower, started no drag at all. The dead region grew with the panel, and the same shift stranded the grab zone sideways on vertical handles. The bias now moves the zone along the pill's axis only.

@cixzhang
