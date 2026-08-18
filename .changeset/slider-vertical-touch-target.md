---
'@astryxdesign/core': patch
---

[fix] `Slider`'s vertical orientation now floors its tap target to the WCAG 2.5.8 AA 24px minimum on coarse-pointer (touch) devices, matching the horizontal orientation's existing floor from #4963. The horizontal fix only covered `minBlockSize` (its narrow axis, height); the vertical orientation's narrow axis is width, which had no such floor, so a vertical `Slider` embedded in a width-constrained layout kept a 20px-wide tap target on touch.

@HelloOjasMutreja
