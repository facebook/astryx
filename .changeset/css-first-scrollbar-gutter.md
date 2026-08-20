---
'@astryxdesign/core': patch
---

[fix] Hold the scrollbar gutter while an overlay is open, so the page behind it doesn't shift sideways

@imdreamrunner

Refines the fix from #5219. Locking background scroll hides the document's
scrollbar; where that scrollbar takes layout space (Windows/Linux desktop, and
macOS set to always show scroll bars) the layout viewport widened by its width
and the page jumped ~15px behind the overlay.

Dialog, BottomSheet, Lightbox, Drawer and MobileNav now hold that gutter with
`scrollbar-gutter: stable`, applied for the duration of the lock and removed on
close. Being a real layout change it holds `position: fixed` chrome — toast
viewports, sticky docks — which the padding compensation it replaces could not:
fixed elements resolve against the viewport, not against the padded element.

Nothing is applied where there is no gutter to hold. Overlay scrollbars (mobile,
and macOS by default) take no layout space, and neither does a page too short to
scroll — so a one-screen marketing page renders exactly as before, full-bleed to
the edge.
