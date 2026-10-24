---
'@astryxdesign/core': patch
---

[feat] On a touch screen, a determinate ProgressBar moves to a new value the way iOS's progress view does: linearly, taking one second per full track of change (0.8 s from 10% to 90%), and from wherever the fill is drawn when the value changes again mid-way. Above zero the fill never draws shorter than two track heights, and at zero it is not drawn. The motion runs on the compositor, so it keeps going while a script runs, and it keeps its pace under reduced motion, as on iOS. With a mouse or trackpad the theme's duration and easing still apply.

@vjeux
