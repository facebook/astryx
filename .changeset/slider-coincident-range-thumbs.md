---
'@astryxdesign/core': patch
---

[fix] Slider: a range slider whose two thumbs sit on the same value can be dragged apart again. Only one of the two thumbs can travel toward a press, so the side of the press picks it. For a press on the shared value itself, the first movement picks the side, and the drag hands that thumb its focus and pressed paint. Before, two thumbs at the maximum could not be dragged down, and a press on the track above two coincident thumbs moved neither.

@vjeux
