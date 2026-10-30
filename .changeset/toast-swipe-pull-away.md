---
'@astryxdesign/core': patch
---

[fix] Under a finger (a coarse primary pointer, on every touch device), a Toast swipe that turns back away from the toast's edge now stretches the card the same way, at about half the finger's travel past the first 14 px, and springs it back on release, as iOS notification banners do; a release there never dismisses, however fast the finger flicks back toward the edge. Before, once the swipe had the touch, such a drag moved neither the card nor the page. With a fine pointer nothing changes.

@vjeux
