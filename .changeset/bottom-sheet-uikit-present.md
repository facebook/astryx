---
'@astryxdesign/core': patch
---

[fix] On iOS, a BottomSheet opened or closed under a finger moves the way an iOS sheet does: on iOS's sheet spring, from below the screen to its detent and back, with the scrim fading on the same spring, on the compositor so a busy page doesn't stall it. Under Reduce Motion it fades in and out on that spring instead of sliding. While it presents, touches are held and a close waits for it to land, as on iOS. Elsewhere (a finger on Android, a mouse) its entrance and exit are unchanged.

@vjeux
