---
'@astryxdesign/core': patch
---

[feat] `List`'s `editingControl` gains `'delete'`, a UIKit table's delete control in edit mode: under a finger (iOS and Android alike), each row with trailing swipe actions shows a disc in the theme's error colour with a bar across it, in its leading column; tapping it opens the row's trailing actions as a swipe does, and tapping it again closes them. A row without trailing actions keeps the indent alone. With a mouse there is no delete control, as swipe actions are touch-only. The control slides in with the rows and fades in on UIKit's table spring, and slides out on leaving.

@vjeux
