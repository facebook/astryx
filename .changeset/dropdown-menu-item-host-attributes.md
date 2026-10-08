---
'@astryxdesign/core': patch
---

[feat] `DropdownMenuItem` passes host attributes and DOM event handlers to its row, as `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem` and `Item` already do: a row can carry `aria-current`, `aria-busy`, a `data-*` mark, an `id`, or drag-and-drop handlers. The row keeps its own role and tab stop; a caller's `onPointerMove` and `onAuxClick` run after the row's hover focus and middle-click close.

@vjeux
