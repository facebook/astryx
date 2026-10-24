---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[chore] Internal: UIPickerView's values measured on iOS 26.2 join the UIKit constants table. They cover the wheel's geometry (row pitch, cylinder radius, perspective, the selection band, the band row's magnification), the coast's stop speed and velocity floor, the snap at rest, the tap spin and the selection tick. The tap spin's duration is a new motion role a theme may retune, `picker.tapSpin.durationMs`, listed in the motion roles table of `astryx docs motion`. The pure math a wheel moves and draws with comes with them. It projects the row a release rests on as UIScrollView sums its deceleration, coasts with the rate re-solved to stop on that row, snaps, bounces at an end on the bounce spring a theme resolved, rubber-bands, spins to a tapped row, and turns each row onto the cylinder. It is checked against UIKit's recorded frames. A player bakes a wheel's motion into per-row Web Animations that run on the compositor, and lands a wheel without travel for reduced motion (an opacity-only cross-fade). Not exported from the package entry point.

@vjeux
