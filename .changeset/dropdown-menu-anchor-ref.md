---
'@astryxdesign/core': patch
---

[feat] `DropdownMenu` takes `anchorRef`, Popover's prop for an external anchor: the popover menu is placed against that element, with `placement` and `alignment` read against it, and takes its width by default, instead of the trigger's. A menu can now line up with a toolbar or a search row wider than its control, while the trigger keeps focus and focus return, the press model, the keyboard opens and the menu's name. The ref is read whenever the menu renders; while it is empty, the trigger is the anchor. The bottom-sheet presentation ignores it.

@vjeux
