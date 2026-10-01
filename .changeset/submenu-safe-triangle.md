---
'@astryxdesign/core': patch
---

[feat] Sub-menu flyouts stay open while the pointer travels toward them, and a press on a sub-menu row opens it without ever closing the menu.

In `DropdownMenuSubMenu` the flyout now stays open while the mouse moves
from the row toward the flyout inside the triangle to its near edge, and
closes after the existing delay once the pointer has left both the row and
that triangle, so a diagonal path to the flyout no longer folds it. A click
or release on a sub-menu row opens its flyout; on an open one it confirms the
flyout and moves focus into it instead of toggling it shut, as macOS sub-menu
rows do. `useMenuHover` gains `flyoutRef` and passes the leave event to
`onMouseLeave`.

@vjeux
