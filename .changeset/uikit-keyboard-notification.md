---
'@astryxdesign/core': patch
---

[chore] Internal: the keyboard notifications' duration has its own export in the UIKit timing table, so code that reads only it bundles no other timing value. Not exported from the package entry point.

@vjeux
