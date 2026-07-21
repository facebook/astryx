---
'@astryxdesign/core': patch
---

[feat] DropdownMenu selectable items: add `DropdownMenuCheckboxItem` (independent toggle, `role="menuitemcheckbox"`) and `DropdownMenuRadioGroup` + `DropdownMenuRadioItem` (single-select, `role="menuitemradio"`). The control size derives from the menu's item size and swaps to the row's inline-end on touch. They also work inside `ContextMenu` (re-exported as `ContextMenuCheckboxItem` / `ContextMenuRadioGroup` / `ContextMenuRadioItem`). Both menus' keyboard/typeahead/activation now recognize the selectable roles, and the menu context (`DropdownMenuContext`, `useDropdownMenuContext`, `DropdownMenuSize`) is exported for building custom menu items. See #3829.

@cixzhang
