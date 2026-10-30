---
'@astryxdesign/core': patch
---

[chore] Internal: the touch press controller leaves the press of an action marked as tracked by its group (`data-astryx-press-group-item`) to that group's own tracker, so one writer paints each press. No component carries the marker yet, so nothing visible or behavioral changes.

@vjeux
