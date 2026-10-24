---
'@astryxdesign/core': patch
---

[chore] Internal: the rule a BottomSheet release will follow, measured from UIKit on iOS 26.2, as a pure function. It picks the stop nearest the sheet's offset plus its velocity × 0.1 s, counting gone below the screen as a stop; from 1008 pt/s a flick goes at least to the next stop in its direction, on the 0.8-damped release spring. It reproduces all 134 measured releases. Not exported from the package entry point; no component uses it yet.

@vjeux
