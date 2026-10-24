---
'@astryxdesign/core': patch
---

[feat] AlertDialog: on a touch screen the alert appears and leaves the way an iOS alert does. It scales down into place from 1.2 while it and the dimming fade in, and it fades out with the dimming when it closes, on the alert's measured spring; the animation keeps running when the page is busy. A touch during either transition does nothing. With reduced motion it only fades. With a mouse nothing changes.

@vjeux
