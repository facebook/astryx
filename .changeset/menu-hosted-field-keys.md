---
'@astryxdesign/core': patch
---

[fix] A field or a button that a DropdownMenu, ContextMenu or sub-menu hosts beside its rows keeps its own keys: typed text, Space and Enter reach the field, its caret keys move the caret until the caret reaches an edge, and Enter or Space press a hosted button. The menu's typeahead and Enter/Space activation used to take those keys, so a field inside a menu could not be typed in. Rows, Tab and Escape behave as before.

@vjeux
