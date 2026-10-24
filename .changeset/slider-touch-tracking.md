---
'@astryxdesign/core': patch
---

[feat] Slider: on iOS the slider tracks a finger as UISlider does. Only the thumb takes a drag, through a 48 px target, so a swipe from the track scrolls the page; a tap on the track or a mark sets the value when the finger lifts, the thumb springing there (UISlider ignores track taps; a drag is not the only pointer way to set the value, WCAG 2.5.7). The value follows the finger’s travel past a 10 px threshold over the track’s length, so the thumb never jumps to the finger. A release coasts on UIKit’s spring before `onChangeEnd` reports. The coast runs on the compositor and keeps moving while the main thread is busy. A mouse, and every other touch screen (Android’s included), keeps the current behavior.
@vjeux
