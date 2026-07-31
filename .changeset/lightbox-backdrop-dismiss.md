---
'@astryxdesign/core': patch
---

[fix] Lightbox: make backdrop click dismissal actually reachable

The dismiss check only matched clicks on the dialog element itself, but the layout container fills the entire transparent dialog, so clicks on the dark area around the media always landed on the container and never closed the lightbox. Clicks on the container now dismiss too, and a pan drag that ends over the backdrop is ignored.
@arham766
