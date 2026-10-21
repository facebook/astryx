---
'@astryxdesign/core': patch
---

[feat] `DropdownMenuSubMenu` takes `header` and `footer`, as the root `DropdownMenu` does: a field that filters a sub-menu's rows, or a door below them, sits beside the sub-menu's menu rather than inside it. With either, the sub-menu's surface (the flyout, or the drilled-in view on a phone) is a modal dialog named by its row: the row says `aria-haspopup="dialog"`, Tab and Shift+Tab walk the header, the rows and the footer and wrap, Escape returns to the row, and a pointer leaving the flyout closes it only once focus leaves too. A `ContextMenu` does not show a sub-menu's `header` or `footer`. Without them nothing changes.

@vjeux
