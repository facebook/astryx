---
'@astryxdesign/core': patch
---

[feat] On an iPhone or iPad (a touch screen in WebKit on iOS or iPadOS), an indeterminate ProgressBar draws iOS Safari's own indeterminate bar: a quarter of the track sweeping linearly from end to end and back, one second per sweep, inside the rounded track. With reduced motion it does not travel: the whole bar pulses between two opacities, one second each way, as Safari's does. Both run on the compositor, so they keep moving while a script runs. The sweep and the pulse are the `progress.indeterminateWebProgress.sweepMs` and `reducedMotionPulseMs` motion roles, which a theme may retune. Android, other touch screens, and a mouse or trackpad keep the 40% slide and its reduced-motion slowdown.

@vjeux
