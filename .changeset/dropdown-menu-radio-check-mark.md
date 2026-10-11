---
'@astryxdesign/core': patch
---

[feat] `DropdownMenuRadioGroup` (and `ContextMenuRadioGroup` and `BreadcrumbMenuRadioGroup`, the same component) takes `indicator="check"` to mark its chosen row with the single-selection check mark, as Selector marks its chosen option, instead of drawing a radio circle on every row. Each row renders the theme's `check` indicator at its inline end, in its own state: the default check draws on the chosen row only, and a theme whose `check` draws an unchecked state shows it on every row. The rows stay `menuitemradio` with `aria-checked`. The default, `radio`, is unchanged.

@vjeux
