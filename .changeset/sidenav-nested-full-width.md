---
'@astryxdesign/core': patch
---

[fix] `SideNavItem`: nested items now span the full width of the nav list, like top-level items, so their hover and selected fill lines up with the rows above them. The indent moves inside the row: each nesting level adds one `--spacing-6` step to the row's inline-start padding, so icons and labels sit exactly where they did before. Content placed directly inside a `SideNavItem` that is not itself a `SideNavItem` is no longer inset by the children group.

@kentonquatman
