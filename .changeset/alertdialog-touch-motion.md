---
'@astryxdesign/core': patch
---

[feat] AlertDialog: under a finger the alert appears and leaves the way an iOS alert does. It scales down into place from 1.2 while it and the dimming fade in, and it fades out with the dimming when it closes, on the alert's measured spring; the animation keeps running when the page is busy. While it appears a touch does nothing (keys and assistive technology still act), and while it leaves nothing reaches it: a touch, a click, a key or an assistive-technology activation does nothing. With reduced motion it only cross-fades. Defaults under a finger: the width with no `width` prop goes from 400 px to UIKit's 320 px, and this motion replaces the Dialog's entrance (rising 16 px and scaling up from 0.95 while it fades in) and its exit. With a mouse nothing changes, and `presentation="dialog"` keeps the previous motion and width under a finger too.

@vjeux
