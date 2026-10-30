---
'@astryxdesign/core': patch
---

[chore] Internal: the UIKit constants table's search entries gain the iOS 26 bottom (toolbar) search field's geometry and measured motion: its resting and active insets, its 38 pt close button and gap, the 16 pt narrowing a cancel starts with, and the field's and close button's frames during activation and cancel, as measured on iOS 26.2. Not exported from the package entry point; Lab's SearchField reads them.

@vjeux
