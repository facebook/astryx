---
'@astryxdesign/core': patch
---

[docs] `ListItem`'s documentation says what `isSelected` does: it marks the row as the current item with `aria-current="true"`. It used to say `aria-selected`, which a list item cannot carry and which the component never set.

@vjeux
