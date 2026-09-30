---
'@astryxdesign/core': patch
---

[docs] Clarify that CheckboxListItem reads `isChecked` and `onCheck` inside a CheckboxList without `value` (such as a select-all item), and requires `value` only when the parent CheckboxList has a `value` array (#6778).

@cixzhang
