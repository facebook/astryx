---
'@astryxdesign/core': patch
---

[feat] Menu arrows wrap, PageUp/PageDown page, and typeahead reads the row label alone.

In `DropdownMenu`, `ContextMenu` and `DropdownMenuSubMenu`, ArrowDown on the
last row wraps to the first and ArrowUp on the first to the last, as macOS
menus do (`Selector` keeps clamping like a native select). PageDown and
PageUp move to the last and first fully visible row of a scrolling menu, and
pressed there again one viewport further, never wrapping. ArrowUp on the
trigger opens the menu with the last row highlighted. The key that opened
the menu no longer activates the first row through its auto-repeat.
Typeahead reads each row's label alone — never its icon slot, description
or badge — and ignores a key that is part of an input-method composition.
`useListFocus` gains `hasPaging`; `Item` marks its label with
`data-astryx-item-label`.

@vjeux
