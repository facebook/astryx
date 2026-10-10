---
'@astryxdesign/core': patch
---

[feat] `DropdownMenuSubMenu` passes host attributes, DOM event handlers and a `ref` to its trigger row, as `DropdownMenuItem` does: a sub-menu row can carry `aria-keyshortcuts`, a `data-*` mark or an `id`, and a caller can reach the row element. The row keeps its own role, tab stop and popup state; a caller's `onClick`, `onKeyDown`, `onPointerMove`, `onMouseEnter` and `onMouseLeave` run after the row's own handling, and a caller's `id` names the row the flyout is labelled by.

@vjeux
