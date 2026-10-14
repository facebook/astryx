---
'@astryxdesign/core': patch
---

[feat] In a `DropdownMenu` with a text field in its `header`, ArrowDown in the field moves to the first row and ArrowUp on the first row returns to the field, as between a combobox's input and its list. A modified arrow, an IME composition and controls with arrows of their own (number, range, multi-line text) keep their keys; without a text field in the header nothing changes.

@vjeux
