---
'@astryxdesign/core': patch
---

[feat] `DropdownMenuRadioGroup` takes `indicatorPosition` (`'start' | 'end'`), Selector's prop with the same meaning: the logical edge of each row that carries the radio mark, on every pointer. Unset, the mark keeps today's placement, at the start under a fine pointer and at the end under a coarse one. The mark stays the theme's `radio` indicator; a menu that wants a check instead is wrapped in a `Theme` whose theme extends the product's with `indicators: {radio: CheckIndicator}`. `ContextMenuRadioGroup` and `BreadcrumbMenuRadioGroup`, the same component under other names, take the prop too.

@vjeux
