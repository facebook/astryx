---
'@astryxdesign/core': patch
---

[fix] `ToastViewport` resets the UA popover `width`, so an end-positioned toast lands on the end edge again. The viewport reaches the top layer through `popover="manual"`, and the UA stylesheet gives every popover `width: fit-content`. Since the placement rework the viewport is positioned by spanning the inline axis and aligning within itself, and a shrink-wrapped box cannot span — both inset edges cannot be honoured, so the box resolves against the start edge and `align-items: flex-end` aligns the toast to the right of a box sitting on the left. Measured in Chromium at 1200px: a 438px viewport at x=0, with the default `bottomEnd` toast at x=19 instead of x=781. The reset block already neutralised `inset`, `margin`, `border` and `background`; `width` belongs with them.

@freddymeta
