---
'@astryxdesign/core': patch
---

[feat] `DropdownMenuSubMenu` takes `header` and `footer`, as the root `DropdownMenu` does: a field that filters a sub-menu's rows, or a door below them, sits beside the sub-menu's menu rather than inside it. With either, the sub-menu's surface (the flyout, or the drilled-in view on a phone) is a modal dialog named by its row: the row says `aria-haspopup="dialog"`, Tab and Shift+Tab walk the header, the rows and the footer and wrap, Escape returns to the row, and the pointer leaving the flyout does not close it while focus is inside. A data item with `items` takes the same `header` and `footer`, and the bottom sheet shows a level's own regions in place of the menu's, read from the current items so a field there filters the level live. A `ContextMenu` does not show a sub-menu's `header` or `footer`. Without them nothing changes.

@vjeux
