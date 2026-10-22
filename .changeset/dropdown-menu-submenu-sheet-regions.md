---
'@astryxdesign/core': patch
---

[feat] A `DropdownMenu` data item with `items` takes `header` and `footer`, as `DropdownMenuSubMenu` does: in the popover they sit above and below that sub-menu's rows, and in the bottom sheet that level shows them in place of the menu's own. With either, the row stays a sub-menu while `items` is empty, so a filter that matches nothing keeps its field. The level is read from the current `items` (by `id`, label, or position when the label changes), so a field there filters it live; give the row an `id` when another row at its level has the same label or the rows can reorder. Each level's regions mount on their own, so what was typed into one field never shows up in another.

@vjeux
