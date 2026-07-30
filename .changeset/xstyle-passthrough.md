---
'@astryxdesign/core': patch
---

[fix] Honor the `xstyle`, `className`, and `style` props on `TopNavMenu`, `TopNavMegaMenu`, `TopNavMegaMenuItem`, `DropdownMenuRadioGroup`, `BaseTypeahead`, `SideNavItem`, and `TypeaheadItem`, which accepted them via `BaseProps` but silently dropped one or more. `VisuallyHidden` now explicitly opts out of all three.
@cixzhang
