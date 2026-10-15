---
'@astryxdesign/core': patch
---

[fix] `Slider`'s `onChangeEnd` now reports the value the drag ended on even when the release arrives before the owner re-renders with the last `onChange` value. A fast drag-and-release used to report the value from before the last move, so a "save on release" handler could store the old value.

@cixzhang
