---
'@astryxdesign/core': patch
---

[feat] DropdownMenu rows take two new options (#4953). `DropdownMenuItem` takes `hasCloseOnSelect`, so a plain action can report its result on the item instead of closing the menu. `DropdownMenuItemData` and `DropdownMenuSection` take an optional `id`, the row's stable React key for a menu whose items reorder or filter (also reaching MoreMenu, ContextMenu and Breadcrumbs, which share the type).

@cixzhang
