---
'@astryxdesign/core': patch
---

[feat] Under a finger, on every touch device, the picker wheels in the TimeInput, DateTimeInput and DateInput bottom sheets now look and move like UIPickerView. The rows sit on a cylinder seen in perspective, and the row in the capsule band is magnified. A flick coasts at UIKit's deceleration onto the row UIKit's projection picks. A finger landing on a moving wheel stops it. A tap on a row turns it onto the band. Past the first or last row, a drag rubber-bands and the wheel bounces back. As on iOS, the value commits when the wheel comes to rest, and the coast keeps running while the page's main thread is busy. Arrow keys and clicks on a row still commit at once. Under reduced motion, a fling, a tap, a key or a programmatic turn cross-fades onto its row instead of turning; the drag itself still follows the finger. A theme can retune the tap spin's duration (`picker.tapSpin.durationMs`) and curve (`timing.curves.move`) and the bounce at an end (`scroll.bounce`). With a mouse the wheels are unchanged.

@vjeux
