---
'@astryxdesign/core': patch
---

[fix] Lightbox, MobileNav: one Escape press closes the layer itself instead of the Dialog it was opened from. Both now claim the press at their own `<dialog>` element, so it never reaches the host's listener or the browser's close request, and both still defer to a focus-trapped layer (popover, menu) above them.

@AKnassa
