---
'@astryxdesign/core': patch
---

[fix] Where the primary pointer is coarse, a BottomSheet's finger or pen drag runs on the shared gesture recognizers: it begins after 10 px of travel and moves the sheet by the travel past that, as UIKit's does, and a second finger that lands during a drag no longer sends the sheet back to its detent. A mouse, and a pen or finger where the primary pointer is fine, drag it as before.

@vjeux
