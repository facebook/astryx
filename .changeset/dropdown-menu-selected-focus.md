---
'@astryxdesign/core': patch
---

[feat] DropdownMenu focuses the current selection on open

`DropdownMenuItem` (and the data-driven `items`) now take an `isSelected` prop. When set, the menu moves initial keyboard focus to that item on open instead of always the first item, exposes it as `aria-current` (the valid "current item in the set" marker for `menuitem`), and renders it in a medium font weight. This keeps the focus highlight on the active choice in menus that represent a current selection — a model or account picker, for example — instead of misleadingly highlighting the first row. Falls back to focusing the first item when nothing is selected.
@lexs
