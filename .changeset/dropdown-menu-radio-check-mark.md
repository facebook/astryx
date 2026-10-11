---
'@astryxdesign/core': patch
---

[feat] `DropdownMenuRadioGroup` takes `indicator="check"` to mark its chosen row with the single-selection check mark, as Selector marks its chosen option, instead of drawing a radio circle on every row. The check sits at the inline end of the chosen row and the other rows draw no mark; the rows stay `menuitemradio` with `aria-checked`. The default, `radio`, is unchanged.

@vjeux
