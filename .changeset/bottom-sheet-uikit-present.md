---
'@astryxdesign/core': patch
---

[fix] On a touch screen a BottomSheet opens and closes the way an iOS sheet does: on iOS's sheet spring, from below the screen to its detent and back, with the scrim fading on the same spring, on the compositor so a busy page doesn't stall it. Under Reduce Motion it fades in and out on that spring instead of sliding. With a mouse its entrance and exit are unchanged.

@vjeux
