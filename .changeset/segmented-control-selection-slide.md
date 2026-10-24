---
'@astryxdesign/core': patch
---

[feat] SegmentedControl: under a finger the selection slides to the new segment on UIKit's spring and the labels cross-fade, whether a tap, an arrow key or a new `value` moved it. The motion runs on the compositor and keeps moving while the main thread is busy. With Reduce Motion nothing travels or scales: the old selection fades out where it is as the new one fades in, and the labels cross-fade on the same clock (`design:reduced-motion`). The spring and the label cross-fade are motion roles (`segmentedControl.*`) a theme can retune; UIKit's measured values are the default theme's, and no theme value lengthens the Reduce Motion fade. With a mouse the color fade stays.
@vjeux
