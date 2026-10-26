---
'@astryxdesign/core': patch
---

[chore] Internal: the refresh control's motion table gains the refresh indicator's measured drawing: each spoke's width, corner radius and inner and outer radius, the refreshing gradient (`spinInstanceAlphaOffset`, `spinFirstInstanceAlpha`) and the spring it comes in on (`triggerGradientSpring`). The guessed `spinAlphaStep` is removed: the measured gradient runs the other way, brightest at the last spoke. Not exported from the package entry point.

@vjeux
