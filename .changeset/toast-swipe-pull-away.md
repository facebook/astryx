---
'@astryxdesign/core': patch
---

[fix] A Toast swipe that turns back away from the toast's edge now stretches the card the same way, at about half the finger's travel past the first 14 px, and springs it back on release, as iOS notification banners do. Before, once the swipe had the touch, such a drag moved neither the card nor the page.

@vjeux
