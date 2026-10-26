---
'@astryxdesign/core': patch
---

[chore] Internal: the UIKit constants table's `tabBar` gains the measured values of the iOS 26 tab bar's bottom accessory: its height, its gap to the bar and to the minimized circle, and the springs it moves inline and back on. Not exported from the package entry point; the lab TabBar imports it by name.

@vjeux
