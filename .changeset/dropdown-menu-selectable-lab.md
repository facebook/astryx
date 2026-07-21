---
'@astryxdesign/core': patch
---

[feat] DropdownMenu selectable items: the menu's keyboard/typeahead/activation path now also recognizes `menuitemradio` and `menuitemcheckbox` rows (not just `menuitem`), and the menu context (`DropdownMenuContext`, `useDropdownMenuContext`, `DropdownMenuSize`) is now exported so consumers can build custom selectable menu items. Powers the new `DropdownMenuCheckboxItem` / `DropdownMenuRadioGroup` / `DropdownMenuRadioItem` in `@astryxdesign/lab`. See #3829.

@cixzhang
