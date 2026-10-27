---
'@astryxdesign/core': patch
---

[feat] A `DropdownMenu` data item with `items` takes `header` and `footer`, as `DropdownMenuSubMenu` does: in the popover they sit above and below that sub-menu's rows, and in the bottom sheet a level with either shows its own in place of both of the menu's. With either, the row stays a sub-menu while `items` is empty, so a filter that matches nothing keeps its field. Every level of the bottom sheet, with or without regions, is now read from the current `items` while it shows (by `id`, by a label no other row at its level shares, or, while the level keeps its row count, by position), so a field there filters it live and a row added, removed or relabelled there shows at once; a row the sheet cannot find again, or one that loses its `items`, keeps the level as it was when it opened. Give the row an `id` when another row at its level has the same label, when its label changes while it shows, or when the rows can reorder or grow. Each level's regions mount on their own, so what was typed into one field never shows up in another.

@vjeux
