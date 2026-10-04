---
'@astryxdesign/core': patch
---

[fix] Defer a layer `show()` that arrives while another popover is mid show/hide, so a tooltip trigger regaining focus from a closing popover no longer throws `InvalidStateError`.

@vjeux
