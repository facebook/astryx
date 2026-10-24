---
'@astryxdesign/core': patch
---

[feat] On iPhone and iPad, a ContextMenu opened by a held finger now presents as iOS 26's does. A copy of a block trigger lifts out of the page: it grows on from the press to 26 px larger on its longer side (15% at most), with the theme's high shadow fading in under it, over the theme's backdrop colour, and it stays 16 px from the screen's sides and 20 px from its top and bottom. A tap on the backdrop closes the menu. The menu sits 16 px from the copy, below it when it fits and above it otherwise, centered on it or flush with the edge it is held against, and its content enters from a blur. Closing returns the copy to the trigger. Inline triggers, pointer opens and the bottom sheet are unchanged. Other touch screens, Android included, keep today's menu under the finger, with nothing lifted.

@vjeux
