---
'@astryxdesign/core': patch
---

[fix] Lightbox shows the next or previous image unzoomed from its first frame. The zoom and pan reset when the image changes now happens in the same update, instead of painting the new image at the previous image's zoom for one frame. (#7351)

@cixzhang
