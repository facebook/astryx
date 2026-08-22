---
'@astryxdesign/core': patch
---

[fix] `Selector` and `MultiSelector` no longer place a `role="separator"` divider inside their `role="listbox"` popup. A `listbox` only permits `option`/`group` children, so a separator among them was a critical axe violation (`aria-required-children`, WCAG 1.3.1/4.1.2) that could drop or mis-report the listbox children in a screen reader. The visual dividers between options now render `role="presentation"`, keeping them out of the accessibility tree while preserving the visual rule. A standalone divider between the search row and the listbox keeps its `role="separator"`. `Divider` now also accepts an explicit `role` prop (default `separator`) so consumers can override it.
