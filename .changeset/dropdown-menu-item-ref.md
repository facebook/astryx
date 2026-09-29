---
'@astryxdesign/core': patch
---

[feat] `DropdownMenuItem`, `DropdownMenuCheckboxItem` and `DropdownMenuRadioItem` forward a `ref` to the row root.

The ref reaches the element carrying `role="menuitem"` (or `menuitemcheckbox`
/ `menuitemradio`), the way `Item` and `DropdownMenuDivider` already forward
one, so a menu row can be registered with an element-keyed observer or
overlay — an IntersectionObserver for an impression, a measurement, a debug
outline — without a wrapper between `role="menu"` and the row.

@vjeux
