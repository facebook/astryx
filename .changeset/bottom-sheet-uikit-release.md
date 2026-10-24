---
'@astryxdesign/core': patch
---

[fix] On iOS, a BottomSheet let go under a finger moves the way an iOS sheet does. It settles on the stop nearest where its speed carries it, a quick flick going at least to the next stop, with gone below the screen counting as a stop, and on iOS's own release spring, starting at the finger's speed instead of from a standstill; under reduced motion it fades in place instead. Elsewhere (a finger on Android, a mouse) a release keeps today's rule and the theme's duration and easing. Everywhere, the settle runs on the compositor, so a busy page no longer stalls it, and a finger can catch the sheet while it settles, on iOS too. The finger's speed is read from when each touch happened rather than when the page got to it.

@vjeux
