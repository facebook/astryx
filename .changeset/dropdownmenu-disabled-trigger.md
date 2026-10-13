---
'@astryxdesign/core': patch
---

[fix] `DropdownMenu` and `MoreMenu`: a disabled trigger no longer opens the menu. A disabled trigger with a tooltip stays focusable (`aria-disabled`), and Button swallowed only Enter and Space, so ArrowDown, ArrowUp, a press, or a click could still open the anchored menu; the anchored open path and the bottom-sheet trigger's click now check the trigger's availability first, for the default Button and for a natively or `aria-disabled` custom trigger.

@cixzhang
