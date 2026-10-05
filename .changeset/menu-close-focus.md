---
'@astryxdesign/core': patch
---

[fix] A DropdownMenu returns focus to its trigger after a pointer dismissal, without painting a focus ring.

`DropdownMenu` used to blur its trigger after a pointer pick or an outside
press, dropping focus to the page so the next arrow key went nowhere. Focus
now returns to the trigger with the focus ring suppressed after pointer
input, as the bottom-sheet presentation already did, and stays visible after
a keyboard pick. A press outside that landed on a focusable control keeps
focus there.

@vjeux
