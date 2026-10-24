---
'@astryxdesign/core': patch
---

[fix] A BottomSheet let go on a touch screen moves the way an iOS sheet does. It settles on the stop nearest where its speed carries it, with gone below the screen counting as a stop, and on iOS's own release spring, starting at the finger's speed instead of from a standstill. The settle runs on the compositor, so a busy page no longer stalls it, and a finger can catch the sheet while it settles. The finger's speed is read from when each touch happened rather than when the page got to it. With a mouse, the settle keeps the theme's duration and easing.

@vjeux
