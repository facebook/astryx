---
'@astryxdesign/core': patch
---

[experimental] Motion: UISlider's values measured on iOS 26.2 join the UIKit constants table: the thumb's 48 pt touch target, the tracking rule (the value moves by the finger's travel past the pan threshold over the track's length), the release coast's spring, projection rate and share, the thumb's lift and drop springs and scale, and the end-of-track haptic. Its three springs are motion roles a theme can retune (`slider.releaseSpring`, `slider.liftSpring`, `slider.dropSpring`), listed in the motion docs' role table. The table ships as `uikit.slider` on `@astryxdesign/core/motion/experimental`; no component uses it yet.
@vjeux
