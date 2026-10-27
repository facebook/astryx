---
'@astryxdesign/core': patch
---

[fix] ProgressBar: with reduced motion on, the fill no longer grows or shrinks to a new value. On a touch screen the fill at its new length fades in, in 200 ms or less; with a mouse it changes at once (design:reduced-motion).

@cixzhang
