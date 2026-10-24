---
'@astryxdesign/core': patch
---

[fix] Under a finger, a SelectableCard's selection mark now changes in one frame, as iOS's selection marks do. Before, the inset ring appeared or vanished at once while the border faded over the theme's fast duration, so the mark changed in two steps. With a mouse the card keeps the theme's fade.

@vjeux
