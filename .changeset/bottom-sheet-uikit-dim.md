---
'@astryxdesign/core': patch
---

[fix] On iOS, a BottomSheet's scrim follows the sheet the way an iOS sheet's dim does. Dragged below its shortest detent, the dim thins in a straight line with the sheet's position and clears only when the sheet reaches the bottom of the screen; it used to clear halfway there. It follows the finger at once instead of easing 300 ms behind. When the sheet settles or is flung away, the dim rides the same spring frame for frame, on the compositor. Elsewhere (a finger on Android, a mouse) the dim is unchanged. A peek detent's lighter scrim is unchanged.

@vjeux
