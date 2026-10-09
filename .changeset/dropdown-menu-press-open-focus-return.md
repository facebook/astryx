---
'@astryxdesign/core': patch
---

[fix] A DropdownMenu opened by a mouse press returns focus to its trigger when it closes, instead of to the control that was focused before the press.

A mouse opens the menu on press-down, before the browser's own mousedown has focused the trigger, so the popover remembered the previously focused control and handed focus back there on Escape or after a pick. The trigger now takes focus as the press opens the menu, the state a click-open already had; keyboard opens, taps and the menu's own behavior are unchanged.

@vjeux
