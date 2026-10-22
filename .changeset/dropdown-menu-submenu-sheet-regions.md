---
'@astryxdesign/core': patch
---

[feat] A `DropdownMenu` data item with `items` takes `header` and `footer`, as `DropdownMenuSubMenu` does: in the popover they sit above and below that sub-menu's rows, and in the bottom sheet a level with either shows its own in place of both of the menu's. With either, the row stays a sub-menu while `items` is empty, so a filter that matches nothing keeps its field. The level is read from the current `items` (by `id`, by a label no other row at its level shares, or, while the level keeps its row count, by position), so a field there filters it live; give the row an `id` when another row at its level has the same label, when its label changes while it shows, or when the rows can reorder or grow. Each level's regions mount on their own, so what was typed into one field never shows up in another.

@vjeux
