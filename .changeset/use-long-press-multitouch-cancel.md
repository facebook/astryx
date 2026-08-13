---
'@astryxdesign/core': patch
---

[fix] useLongPress: cancel the pending long-press when a second finger joins mid-press. Previously `onTouchStart` and `onTouchMove` only checked `touches.length` on their own event, so a second finger arriving after a single-finger press had already started the timer (e.g. a pinch-to-zoom gesture) fell through the `touches.length !== 1` guard without ever clearing it — `onLongPress` could still fire with the stale first-finger point mid-gesture. No API change. (#4735)
@alex-js-ltd
