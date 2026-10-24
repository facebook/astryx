---
'@astryxdesign/core': patch
---

[feat] SegmentedControl: on iPhone and iPad the selection slides to the new segment on UIKit's spring and the labels cross-fade, whether a tap, an arrow key or a new `value` moved it. The motion runs on the compositor and keeps moving while the main thread is busy; with Reduce Motion the selection moves without travel. The spring and the cross-fade are motion roles (`segmentedControl.*`) a theme can retune; UIKit's measured values are the default theme's. Other touch screens and desktops keep the color fade.
@vjeux
