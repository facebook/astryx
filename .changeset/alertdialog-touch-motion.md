---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] AlertDialog: under a finger the alert appears and leaves the way an iOS alert does. It scales down into place from 1.2 while it and the dimming fade in, and it fades out with the dimming when it closes, on the alert's measured spring; the animation keeps running when the page is busy. While it appears a touch does nothing (keys and assistive technology still act), and while it leaves nothing reaches it: a touch, a click, a key or an assistive-technology activation does nothing. With reduced motion it only cross-fades. With a mouse nothing changes, and `presentation="dialog"` keeps the previous motion and width under a finger too. Themes can retune the alert's presentation and dismissal durations (`alertController.present.durationMs`, `alertController.dismiss.durationMs`), listed in `astryx docs motion`.

@vjeux
