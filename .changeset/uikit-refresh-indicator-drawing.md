---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[experimental] `uikit.refreshControl` (from `@astryxdesign/core/motion/experimental`) gains the refresh indicator's measured drawing: each spoke's width, corner radius and inner and outer radius, the refreshing gradient (`spinInstanceAlphaOffset`, `spinFirstInstanceAlpha`) and the spring it comes in on (`triggerGradientSpring`). The guessed `spinAlphaStep` is removed: the measured gradient runs the other way, brightest at the last spoke. `astryx docs motion` lists the gradient's spring as the `refreshControl.triggerGradientSpring` motion role.

@vjeux
