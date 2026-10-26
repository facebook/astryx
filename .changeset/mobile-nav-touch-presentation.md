---
'@astryxdesign/core': patch
---

[fix] Under a finger, MobileNav presents and dismisses as an iOS sheet does. It takes no touch until its slide-in ends and no input until its slide-out ends, at most 550 ms. Its dialog stays open through the slide-out, so the scrim fades over the whole of it, and focus returns when the slide-out ends. Under a mouse nothing changes.

@vjeux
