---
'@astryxdesign/core': patch
---

[fix] Carousel keeps keyboard focus inside the component when a nav button press runs the content to an edge and disables that button, instead of letting focus fall to the document body. The scroll container is also now a documented theme target, `astryx-carousel-scroller`, carrying the gap, padding, snap and edge-fade props it styles, so a theme can reach the spacing and the fade it could not see before.

@cixzhang
