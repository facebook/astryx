---
'@astryxdesign/core': patch
---

[chore] Internal: UISlider's values measured on iOS 26.2 join the UIKit constants table: the thumb's 48 pt touch target, the tracking rule (the value moves by the finger's travel past the pan threshold over the track's length), the release coast's spring, projection rate and share, the thumb's lift and drop springs and scale, and the end-of-track haptic. Not exported from the package entry point; no component uses it yet.
@vjeux
