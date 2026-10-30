---
'@astryxdesign/core': patch
---

[chore] Internal: the UIKit constants table's `tabBar` gains the measured values of the iOS 26 tab bar's minimize on scroll: the scroll distance that collapses it, the minimized circle's size, the lens's travel and size springs into and out of the circle, and a provisional fade spring for the items (`minimizeFade`, still a guess pending its measurement, M-TB1). Not exported from the package entry point; the lab TabBar imports it by name.

@vjeux
