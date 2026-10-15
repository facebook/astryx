---
'@astryxdesign/core': patch
---

[feat] `SideNavItem`: nested items now span the full width of the nav list, like top-level items, so their hover and selected fill lines up with the rows above them. Before, a nested item started 24px in from the list edge. The indent now sits inside the row, one `--spacing-6` step per nesting level, so icons and labels stay exactly where they were. The indent area is now part of the nested row, so it shows hover feedback and clicking it activates the item. Content placed directly inside a `SideNavItem` that is not itself a `SideNavItem` is no longer inset by the children group. There is no supported way to keep the old inset look.

@kentonquatman
