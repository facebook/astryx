---
'@astryxdesign/core': patch
---

[fix] A BottomSheet opened or closed under a finger, on every touch device, moves the way an iOS sheet does: on iOS's sheet spring, from below the screen to its detent and back, with the scrim fading on the same spring, on the compositor so a busy page doesn't stall it. Under reduced motion it fades in and out in place, in 200 ms or less, instead of sliding. While it presents, touches are held and a close waits for it to land, as on iOS. Under a mouse its entrance and exit are unchanged.

@vjeux
