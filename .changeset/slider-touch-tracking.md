---
'@astryxdesign/core': patch
---

[feat] Slider: on touch screens the slider tracks a finger as iOS does. Only the thumb takes the finger, through a 48 px target, so a tap on the track does nothing and a swipe from it scrolls the page. The value follows the finger’s travel past a 10 px threshold over the track’s length, so the thumb never jumps to the finger. A release coasts on UIKit’s spring before `onChangeEnd` reports. The coast runs on the compositor and keeps moving while the main thread is busy. A mouse keeps the current behavior.
@vjeux
