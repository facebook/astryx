---
'@astryxdesign/core': patch
---

[feat] `DropdownMenu` takes `popoverXstyle`: StyleX styles for the popover that presents the menu, the surface that paints its background, corner radius and elevation. `xstyle` keeps styling the menu inside that box, which paints no background of its own, so it could not change the box a viewer sees. Sub-menu flyouts keep their own surfaces, and the bottom-sheet presentation ignores the prop.

@vjeux
