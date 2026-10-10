---
'@astryxdesign/core': patch
---

[fix] A ContextMenu opened by a long press stays open: the compatibility `mousedown` a browser sends for the touch (mid-hold on iOS, as the finger lifts in Chromium) no longer reads as a press outside. Outside dismissal follows pointer events: a mouse or pen press outside closes the menu at once, and a finger's tap outside closes it, while a scroll that starts outside still leaves it open.

@vjeux
