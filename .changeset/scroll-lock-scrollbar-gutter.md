---
'@astryxdesign/core': patch
---

[fix] Opening a Dialog, BottomSheet, Lightbox, or MobileNav no longer shifts the page sideways when the browser has a classic scrollbar

@imdreamrunner

Locking background scroll hides the document's scrollbar. Where that scrollbar
takes layout space — Windows/Linux desktop, and macOS set to always show scroll
bars — hiding it widened the layout viewport by its width (~15px), so the whole
page reflowed sideways behind the overlay and back again on close.

Both scroll locks now measure that width before they hide the scrollbar and
reserve it as padding for the duration of the lock. Overlay scrollbars measure
0 and are untouched. The reserved width is published as
`--astryx-scrollbar-gutter` so `position: fixed` chrome, which body padding
can't hold, can compensate too.
