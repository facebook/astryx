---
'@astryxdesign/core': patch
---

[fix] Carousel: mirror the single-edge fade gradients under RTL so the mask fades the physical edge that actually hides content (overflowStart/overflowEnd are logical edges, the gradients were always physical left/right)

@mattandryc
