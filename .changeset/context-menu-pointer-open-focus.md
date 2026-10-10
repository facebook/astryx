---
'@astryxdesign/core': patch
---

[fix] A ContextMenu opened by a right-click or a long press no longer highlights its first row: focus goes to the menu itself, so the highlight starts where the pointer goes, as a DropdownMenu opened from its trigger already does. A keyboard-invoked open (Shift+F10, the Menu key) still lands on the first row.

@vjeux
