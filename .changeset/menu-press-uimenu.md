---
'@astryxdesign/core': patch
---

[feature] A finger on a DropdownMenu or MoreMenu trigger follows UIMenu: resting on the trigger opens the menu after 150 ms (UIKit's delay; 300 ms inside a scrolling region, which waits for the scroll view's content-touch delay first), and the finger that opened the menu picks a row only after it has moved 10 px, so a menu that appears under a resting finger never picks the row beneath it. A mouse keeps its settle rule. `useMenuPress` gains `continueGesture` for a pointer that went down elsewhere (a context menu's long press), and `longPressDelayMs` defaults to 150.

@vjeux
