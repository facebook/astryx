---
'@astryxdesign/core': patch
---

[feat] DropdownMenuSubMenu drills in on a phone instead of opening a flyout.

When a coarse pointer opened the menu, a sub-menu row replaces the menu's rows
with its own and a "Back to <parent>" row, in the same box; Back, Escape or
ArrowLeft return to the row. Works in compound and data mode, inside
`DropdownMenu` and `ContextMenu`; `presentation` (`flyout` | `drill-in` |
`adaptive`) overrides the policy.

@vjeux
