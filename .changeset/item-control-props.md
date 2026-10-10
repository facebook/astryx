---
'@astryxdesign/core': patch
---

[feat] `Item` gains `controlProps`: attributes for the control the row renders for `onClick` or `href` (the invisible button or anchor the label sits in, where keyboard focus lands). A disclosure row's `aria-expanded`, `aria-haspopup` and `aria-controls`, a toggle's `aria-pressed`, a name of its own (`aria-label`, `aria-labelledby`), a host's `data-*` marks, `onKeyDown` and a composite's roving `tabIndex` reach the focused control instead of the root, where a screen reader does not read them. The row's own attributes win where they conflict (a disabled row keeps `tabIndex={-1}` and `aria-disabled`); where the root is the link (`as`), they land on the root; a row that renders no control (a `role`, an `interactiveRef`) ignores them with a development warning. Type `ItemControlProps` is exported.

@vjeux
