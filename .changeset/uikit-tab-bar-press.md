---
'@astryxdesign/core': patch
---

[chore] Internal: the UIKit constants table's `tabBar` gains the measured values of the iOS 26 tab bar's press: the selection lens's tracking and settle springs, its lift (outset, magnification, spring), the bar's flex (scale and springs) and the lens's rubber band past the first and last tabs. Not exported from the package entry point; the lab TabBar imports it by name.

@vjeux
