---
'@astryxdesign/core': minor
---

[breaking] In a `DropdownMenu` popover with a single-line text field in its `header`, ArrowDown in the field now moves to the menu's first row, and ArrowUp on that row then returns to the field, as between a combobox's input and its list; until a field has handed ArrowDown on, ArrowUp on the first row wraps as before. Before, the field kept ArrowDown, as the `header` docs said ("It keeps its own keys and presses"). A modified arrow, an IME composition, a combobox, a spinbutton such as `NumberInput`, an input with a `list`, and controls with arrows of their own (number, range, multi-line text) keep their keys, and so do the bottom sheet and a drilled-in sub-menu view.

To keep ArrowDown in a header field, prevent its default in the field's own `onKeyDown`: a field that handled the key keeps it. There is no codemod: whether a field relies on ArrowDown staying in it cannot be read from its source.

@vjeux
