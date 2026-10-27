---
'@astryxdesign/core': patch
---

[feature] A finger now follows the menus' finger rules on every device, a touchscreen laptop (a fine primary pointer) as a phone (`spec:AST-094` FR43): DropdownMenu and MoreMenu open as the finger presses their trigger, the finger that opened the menu picks a row only after moving 10 px, and a cancelled touch clears the row it lit. `useMenuPress` with no `longPressDelayMs` does the same on every device. A mouse is unchanged, and `presentation="popover"` keeps the released finger behavior.

@vjeux
