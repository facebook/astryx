---
'@astryxdesign/core': patch
---

[feat] Lightbox's zoom now works under a finger the way the iOS Photos viewer does, on phones and tablets (a coarse primary pointer). Pinch the photo to zoom around your fingers, and move them to pan while you zoom. Past the zoom limits the photo gives way, then eases back when you let go. Double-tap zooms until the photo fills the screen, bringing the tapped point to the centre; double-tap again to go back. A zoomed photo pans with momentum, stretches past its edges and settles back. A mouse, a pen where the primary pointer is fine, and the keyboard keep the zoom they had: 2× about the centre, over the same 200 ms ease-out. A mouse drag and keyboard panning now stop at the photo's edges instead of carrying it out of view.

On a phone the photo's stage fills the viewer. A pinch on the photo no longer zooms the page, and a pinch on the controls or caption still does. With `hasZoom` on, a tap on the dark area beside the photo closes the viewer after the double-tap wait instead of at once. The zoom animations run on the compositor, so they stay smooth while the page is busy. With `hasZoom` off, nothing changes.

@vjeux
