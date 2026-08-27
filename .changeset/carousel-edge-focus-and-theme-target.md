---
'@astryxdesign/core': patch
---

[fix] Carousel no longer drops keyboard focus to the document body when reaching a scroll edge disables the nav button in use. Focus moves to the opposite arrow instead, on the state transition that disables the button rather than on a prediction from the press, so it holds under reduced motion, under scroll-snap, and on browsers without `scrollend`. The scroll container is also now a documented theme target, `astryx-carousel-scroller`, carrying the gap, padding, snap and edge-fade props it styles, so a theme can reach the spacing and the fade it could not see before.

@cixzhang
