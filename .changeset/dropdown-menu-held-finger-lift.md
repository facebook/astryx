---
'@astryxdesign/core': patch
---

[fix] A DropdownMenu that a finger held on its trigger opens (after the long-press delay) stays open when that finger lifts on the trigger (#7241). The browser's light dismiss read the lift, outside the menu, as a press outside and closed the menu at once; the trigger is now held as the menu's invoker through the press, as it already was for a mouse press.

@vjeux
