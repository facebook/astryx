---
'@astryxdesign/core': patch
---

[fix] A ContextMenu opened by a long press stays open as the finger lifts: the compatibility `mousedown` the browser sends for the touch no longer reads as a press outside. Outside dismissal follows pointer events: a mouse press outside closes the menu at once, a finger's or a pen's tap outside closes it on the lift, and a scroll that starts outside still leaves it open.

Some outside presses now behave differently. A pen closes the menu on its lift rather than at the press, as the menu press model treats a pen like a finger. Presses the `mousedown` listener never saw now close it too: a press on a control that cancels or stops its `pointerdown` (a NumberInput stepper, a resize handle), and, on the lift, a finger drag on a surface with `touch-action: none` (a Slider) or a second finger's tap.

@vjeux
