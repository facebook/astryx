---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] On an iPhone or iPad (a touch screen in WebKit on iOS or iPadOS), a determinate ProgressBar moves to a new value the way iOS's progress view does: linearly, taking one second per full track of change (0.8 s from 10% to 90%), and from wherever the fill is drawn when the value changes again mid-way. Above zero the fill never draws shorter than two track heights, and at zero it is not drawn. The motion runs on the compositor, so it keeps going while a script runs, and it keeps its pace under reduced motion, as on iOS. The whole-track duration is the `progress.progressView.wholeTrackMs` motion role, which a theme may retune, and `astryx docs motion` lists it. Android, other touch screens, and a mouse or trackpad keep the theme's duration and easing.

@vjeux
