---
'@astryxdesign/core': patch
---

[fix] A ContextMenu opened by a finger's long press stays open as the finger lifts: the compatibility `mousedown` the browser sends for that press (while it is held on iOS, as it lifts in Chromium) no longer reads as a press outside. Every other press outside the menu closes it, or leaves it open, as before.

@vjeux
