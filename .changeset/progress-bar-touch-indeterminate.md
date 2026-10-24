---
'@astryxdesign/core': patch
---

[feat] On a touch screen, an indeterminate ProgressBar draws iOS Safari's own indeterminate bar: a quarter of the track sweeping linearly from end to end and back, one second per sweep, inside the rounded track. With reduced motion it does not travel: the whole bar pulses between two opacities, one second each way, as Safari's does. Both run on the compositor, so they keep moving while a script runs. With a mouse or trackpad the 40% slide is unchanged.

@vjeux
