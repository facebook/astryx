---
'@astryxdesign/core': patch
---

[feat] Lightbox's zoom now works under a finger the way the iOS Photos viewer does, on every touch screen. Pinch the photo to zoom around your fingers, and move them to pan while you zoom. Past the zoom limits the photo gives way, then eases back when you let go. Double-tap zooms until the photo fills the screen, bringing the tapped point to the centre; double-tap again to go back. A zoomed photo pans with momentum, stretches past its edges and settles back. With a mouse the zoom and a drag stop at the limits and edges, as before. Keyboard panning now stops at the photo's edges.

On a phone the photo's stage fills the viewer. A pinch on the photo no longer zooms the page, and a pinch on the controls or caption still does. The zoom animations run on the compositor, so they stay smooth while the page is busy. With `hasZoom` off, nothing changes.

@vjeux
