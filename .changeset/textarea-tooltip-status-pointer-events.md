---
'@astryxdesign/core': patch
---

[fix] Inputs (`statusVariant="tooltip"`): the focusable status button now opens its tooltip on hover inside `TextArea`, whose absolutely-positioned trailing slot is `pointer-events: none`. Keyboard focus already worked; pointer hover did not (#5147).

@freddymeta
