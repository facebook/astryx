---
'@astryxdesign/core': patch
---

[chore] Internal: the UIKit constants table's `tabBar` gains the measured values of the iOS 26 tab bar's active search field: its gap above the software keyboard and when its cancel button appears. The message catalog gains `@astryx.tabBar.cancelSearch` ("Cancel"). Not exported from the package entry point; the lab TabBar imports it by name.

@vjeux
