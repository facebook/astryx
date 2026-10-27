---
'@astryxdesign/core': patch
---

[fix] A mouse drags a BottomSheet through the same gesture recognizers as a finger: its drag begins once it has moved 10 px, and its release dismisses the sheet or picks a detent by the same rule as a finger's. The tracking and the theme's release timing under a mouse are unchanged.

@vjeux
