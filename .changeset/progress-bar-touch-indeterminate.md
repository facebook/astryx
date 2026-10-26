---
'@astryxdesign/core': patch
---

[feat] Under a finger (a coarse primary pointer, on every touch device), an indeterminate ProgressBar draws iOS Safari's own indeterminate bar: a quarter of the track sweeping linearly from end to end and back, one second per sweep, inside the rounded track. With reduced motion it does not travel: the whole bar pulses in place, one second each way, as Safari's does, between opacities that keep the accent, success and error bars at 3:1 contrast against the page. Both run on the compositor, so they keep moving while a script runs. A mouse or trackpad keeps the 40% slide and its reduced-motion slowdown.

@vjeux
