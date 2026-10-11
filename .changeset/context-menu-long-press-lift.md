---
'@astryxdesign/core': patch
---

[fix] A ContextMenu opened by a long press stays open as the finger lifts: the compatibility `mousedown` the browser sends for the touch no longer reads as a press outside. Outside dismissal follows pointer events: a mouse press outside closes the menu at once, a finger's or a pen's tap outside closes it on the lift, and a scroll that starts outside still leaves it open. A pen now waits for its lift, as the menu press model treats a pen like a finger.

@vjeux
