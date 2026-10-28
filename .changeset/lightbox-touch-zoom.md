---
'@astryxdesign/core': patch
---

[feat] Lightbox's zoom now works under a finger the way the iOS Photos viewer does, on phones and tablets (a coarse primary pointer). Pinch the photo to zoom around your fingers, and move them to pan while you zoom. Past the zoom limits the photo gives way, then eases back when you let go. Double-tap zooms until the photo fills the screen, bringing the tapped point to the centre; double-tap again to go back. A zoomed photo pans with momentum, stretches past its edges and settles back. The keyboard keeps the zoom it had: 2× about the centre, over the same 200 ms ease-out, and keyboard panning now stops at the photo's edges instead of carrying it out of view.

The photo's stage fills the viewer. A pinch on the photo no longer zooms the page, and a pinch on the controls or caption still does. With `hasZoom` on, a tap or a click on the dark area beside the photo closes the viewer after the double-tap wait instead of at once. The zoom animations run on the compositor, so they stay smooth while the page is busy. With `hasZoom` off, nothing changes.

@vjeux
