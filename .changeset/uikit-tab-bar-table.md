---
'@astryxdesign/core': patch
---

[chore] Internal: the UIKit constants table gains `tabBar` (registered as motion roles by `registerTabBarTable()`): the iOS 26 tab bar's measured geometry (capsule, items, badge), its selection lens's travel spring, each with its source. Nothing else changes. Not exported from the package entry point; the lab TabBar imports it by name.

@vjeux
