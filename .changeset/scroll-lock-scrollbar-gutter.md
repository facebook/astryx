---
'@astryxdesign/core': patch
---

[fix] Opening a Dialog, BottomSheet, Lightbox, or MobileNav no longer shifts the page sideways when the browser has a classic scrollbar

@imdreamrunner

Locking background scroll hides the document's scrollbar. Where that scrollbar
takes layout space — Windows/Linux desktop, and macOS set to always show scroll
bars — hiding it widened the layout viewport by its width (~15px), so the whole
page reflowed sideways behind the overlay and back again on close.

Both scroll locks now hold that gutter open with `scrollbar-gutter: stable` for
the duration of the lock, which keeps `position: fixed` chrome (sticky headers,
toast viewports) still as well as in-flow content. Pages with no space-taking
scrollbar, and pages that already set `scrollbar-gutter` themselves, are left
alone. Engines without `scrollbar-gutter` support fall back to padding the
measured difference.
