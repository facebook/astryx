---
'@astryxdesign/core': patch
---

[fix] `DropdownMenu` and `MoreMenu`: a disabled trigger no longer opens the menu. A disabled trigger with a tooltip stays focusable (`aria-disabled`), and Button swallowed only Enter and Space, so ArrowDown, ArrowUp, a press, or a click could still open the menu; every open path now checks the trigger's availability first.

@cixzhang
