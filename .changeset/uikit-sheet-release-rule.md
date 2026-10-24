---
'@astryxdesign/core': patch
---

[chore] Internal: the rule a BottomSheet release will follow, measured from UIKit on iOS 26.2, as a pure function. It picks the stop nearest the sheet's offset plus its velocity × 0.114 s, counting gone below the screen as a stop, and picks the 0.8-damped release spring from 1072 pt/s up. Not exported from the package entry point; no component uses it yet.

@vjeux
