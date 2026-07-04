---
'@astryxdesign/core': patch
---

[fix] Toast: remove the invalid `aria-modal` attribute from the notifications viewport. `aria-modal` is only valid on `role="dialog"` / `alertdialog`, so declaring it on the `role="region"` viewport was flagged by axe (`aria-allowed-attr`). Because the viewport renders on every page, this surfaced the violation across the whole app (#3343).
@cixzhang
