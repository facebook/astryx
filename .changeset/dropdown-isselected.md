---
'@astryxdesign/core': patch
---

[feat] Add `isSelected` support to DropdownMenu items for single-select menus. When `isSelected` is defined (true or false), the item renders as `role="menuitemradio"` with `aria-checked` and a check indicator when selected; unselected siblings reserve the space so layout stays stable. Undefined keeps the default `role="menuitem"` behavior. Also available via MoreMenu/ContextMenu (shared `DropdownMenuOption`); keyboard navigation and Enter/Space activation now recognize `menuitemradio` items.

@thedjpetersen
