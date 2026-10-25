---
'@astryxdesign/core': patch
---

[chore] Internal: the press tracker reports only UIControl's control events and paints nothing; the press feedback paints every pressable surface, a press-tracked control included. `keepsTouch` still keeps a held control's touch once its press is delivered. Not exported from the package entry point; no component uses it yet.

@vjeux
